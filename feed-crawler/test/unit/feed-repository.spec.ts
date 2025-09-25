import 'reflect-metadata';
import { FeedRepository } from '../../src/repository/feed.repository';
import { RedisConnection } from '../../src/common/redis-access';
import { DatabaseConnection } from '../../src/types/database-connection';
import { FeedDetail } from '../../src/common/types';
import { redisConstant } from '../../src/common/constant';

describe('FeedRepository', () => {
  let feedRepository: FeedRepository;
  let mockDatabaseConnection: jest.Mocked<DatabaseConnection>;
  let mockRedisConnection: jest.Mocked<RedisConnection>;

  const mockFeedDetails: FeedDetail[] = [
    {
      id: null,
      blogId: 1,
      blogName: '테스트 블로그 1',
      blogPlatform: 'tistory',
      pubDate: '2024-01-01 12:00:00',
      title: '테스트 피드 1',
      link: 'https://test1.tistory.com/1',
      imageUrl: 'https://test1.tistory.com/image1.jpg',
      content: '테스트 내용 1',
      summary: 'AI 요약 처리 중...',
      deathCount: 0,
    },
    {
      id: null,
      blogId: 2,
      blogName: '테스트 블로그 2',
      blogPlatform: 'velog',
      pubDate: '2024-01-01 12:30:00',
      title: '테스트 피드 2',
      link: 'https://velog.io/@test2/2',
      imageUrl: 'https://velog.io/image2.jpg',
      content: '테스트 내용 2',
      summary: 'AI 요약 처리 중...',
      deathCount: 0,
    },
  ];

  beforeEach(() => {
    mockDatabaseConnection = {
      executeQuery: jest.fn(),
      executeQueryStrict: jest.fn(),
    } as any;

    mockRedisConnection = {
      scan: jest.fn(),
      del: jest.fn(),
      executePipeline: jest.fn(),
      hset: jest.fn(),
      lpush: jest.fn(),
    } as any;

    feedRepository = new FeedRepository(
      mockDatabaseConnection,
      mockRedisConnection,
    );
  });

  describe('insertFeeds', () => {
    it('피드를 성공적으로 삽입해야 한다', async () => {
      // Given
      const mockInsertResults = [{ insertId: 1 }, { insertId: 2 }];
      mockDatabaseConnection.executeQueryStrict
        .mockResolvedValueOnce(mockInsertResults[0])
        .mockResolvedValueOnce(mockInsertResults[1]);

      // When
      const result = await feedRepository.insertFeeds(mockFeedDetails);

      // Then
      expect(mockDatabaseConnection.executeQueryStrict).toHaveBeenCalledTimes(
        2,
      );
      expect(mockDatabaseConnection.executeQueryStrict).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('INSERT INTO feed'),
        [
          mockFeedDetails[0].blogId,
          mockFeedDetails[0].pubDate,
          mockFeedDetails[0].title,
          mockFeedDetails[0].link,
          mockFeedDetails[0].imageUrl,
          mockFeedDetails[0].summary,
        ],
      );
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it('중복 피드를 올바르게 처리해야 한다', async () => {
      // Given
      const duplicateError = {
        code: 'ER_DUP_ENTRY',
        message: 'Duplicate entry',
      };
      mockDatabaseConnection.executeQueryStrict
        .mockResolvedValueOnce({ insertId: 1 })
        .mockRejectedValueOnce(duplicateError);

      // When
      const result = await feedRepository.insertFeeds(mockFeedDetails);

      // Then
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].title).toBe(mockFeedDetails[0].title);
    });

    it('중복이 아닌 에러는 다시 던져야 한다', async () => {
      // Given
      const otherError = new Error('Database connection failed');
      mockDatabaseConnection.executeQueryStrict
        .mockResolvedValueOnce({ insertId: 1 })
        .mockRejectedValueOnce(otherError);

      // When & Then
      await expect(feedRepository.insertFeeds(mockFeedDetails)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('모든 피드가 중복일 때 빈 배열을 반환해야 한다', async () => {
      // Given
      const duplicateError = {
        code: 'ER_DUP_ENTRY',
        message: 'Duplicate entry',
      };
      mockDatabaseConnection.executeQueryStrict
        .mockRejectedValueOnce(duplicateError)
        .mockRejectedValueOnce(duplicateError);

      // When
      const result = await feedRepository.insertFeeds(mockFeedDetails);

      // Then
      expect(result).toHaveLength(0);
    });
  });

  describe('deleteRecentFeed', () => {
    it('Redis에서 최근 피드 캐시를 삭제해야 한다', async () => {
      // Given
      const mockKeys = ['feed:recent:1', 'feed:recent:2', 'feed:recent:3'];
      mockRedisConnection.scan
        .mockResolvedValueOnce(['10', ['feed:recent:1', 'feed:recent:2']])
        .mockResolvedValueOnce(['0', ['feed:recent:3']]);

      // When
      await feedRepository.deleteRecentFeed();

      // Then
      expect(mockRedisConnection.scan).toHaveBeenCalledTimes(2);
      expect(mockRedisConnection.scan).toHaveBeenNthCalledWith(
        1,
        '0',
        redisConstant.FEED_RECENT_ALL_KEY,
        100,
      );
      expect(mockRedisConnection.scan).toHaveBeenNthCalledWith(
        2,
        '10',
        redisConstant.FEED_RECENT_ALL_KEY,
        100,
      );
      expect(mockRedisConnection.del).toHaveBeenCalledWith(...mockKeys);
    });

    it('삭제할 키가 없을 때 del을 호출하지 않아야 한다', async () => {
      // Given
      mockRedisConnection.scan.mockResolvedValueOnce(['0', []]);

      // When
      await feedRepository.deleteRecentFeed();

      // Then
      expect(mockRedisConnection.scan).toHaveBeenCalledTimes(1);
      expect(mockRedisConnection.del).not.toHaveBeenCalled();
    });

    it('Redis 에러를 올바르게 처리해야 한다', async () => {
      // Given
      const redisError = new Error('Redis connection failed');
      mockRedisConnection.scan.mockRejectedValueOnce(redisError);

      // When & Then
      await expect(feedRepository.deleteRecentFeed()).resolves.not.toThrow();
    });
  });

  describe('setRecentFeedList', () => {
    it('최근 피드 목록을 Redis에 저장해야 한다', async () => {
      // Given
      const feedsWithId = mockFeedDetails.map((feed, index) => ({
        ...feed,
        id: index + 1,
      }));

      // When
      await feedRepository.setRecentFeedList(feedsWithId);

      // Then
      expect(mockRedisConnection.executePipeline).toHaveBeenCalledTimes(1);
      const pipelineCallback =
        mockRedisConnection.executePipeline.mock.calls[0][0];
      const mockPipeline = {
        hset: jest.fn(),
      };
      pipelineCallback(mockPipeline);

      expect(mockPipeline.hset).toHaveBeenCalledTimes(2);
      expect(mockPipeline.hset).toHaveBeenNthCalledWith(1, 'feed:recent:1', {
        id: 1,
        blogPlatform: feedsWithId[0].blogPlatform,
        createdAt: feedsWithId[0].pubDate,
        viewCount: 0,
        blogName: feedsWithId[0].blogName,
        thumbnail: feedsWithId[0].imageUrl,
        path: feedsWithId[0].link,
        title: feedsWithId[0].title,
        tag: [],
        likes: 0,
        comments: 0,
      });
    });

    it('tag가 배열이 아닐 때 빈 배열로 설정해야 한다', async () => {
      // Given
      const feedWithNonArrayTag = {
        ...mockFeedDetails[0],
        id: 1,
        tag: 'string-tag' as any,
      };

      // When
      await feedRepository.setRecentFeedList([feedWithNonArrayTag]);

      // Then
      const pipelineCallback =
        mockRedisConnection.executePipeline.mock.calls[0][0];
      const mockPipeline = {
        hset: jest.fn(),
      };
      pipelineCallback(mockPipeline);

      expect(mockPipeline.hset).toHaveBeenCalledWith(
        'feed:recent:1',
        expect.objectContaining({
          tag: [],
        }),
      );
    });

    it('Redis 에러를 올바르게 처리해야 한다', async () => {
      // Given
      const redisError = new Error('Redis connection failed');
      mockRedisConnection.executePipeline.mockRejectedValueOnce(redisError);
      const feedsWithId = mockFeedDetails.map((feed, index) => ({
        ...feed,
        id: index + 1,
      }));

      // When & Then
      await expect(
        feedRepository.setRecentFeedList(feedsWithId),
      ).resolves.not.toThrow();
    });
  });

  describe('updateSummary', () => {
    it('피드 요약을 업데이트해야 한다', async () => {
      // Given
      const feedId = 1;
      const summary = '업데이트된 요약입니다.';

      // When
      await feedRepository.updateSummary(feedId, summary);

      // Then
      expect(mockDatabaseConnection.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE feed'),
        [summary, feedId],
      );
    });
  });

  describe('updateNullSummary', () => {
    it('피드 요약을 NULL로 업데이트해야 한다', async () => {
      // Given
      const feedId = 1;

      // When
      await feedRepository.updateNullSummary(feedId);

      // Then
      expect(mockDatabaseConnection.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE feed'),
        [feedId],
      );
      expect(mockDatabaseConnection.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('summary=NULL'),
        [feedId],
      );
    });
  });

  describe('saveAiQueue', () => {
    it('AI 큐에 피드 데이터를 저장해야 한다', async () => {
      // Given
      const feedsWithId = mockFeedDetails.map((feed, index) => ({
        ...feed,
        id: index + 1,
      }));

      // When
      await feedRepository.saveAiQueue(feedsWithId);

      // Then
      expect(mockRedisConnection.executePipeline).toHaveBeenCalledTimes(1);
      const pipelineCallback =
        mockRedisConnection.executePipeline.mock.calls[0][0];
      const mockPipeline = {
        lpush: jest.fn(),
      };
      pipelineCallback(mockPipeline);

      expect(mockPipeline.lpush).toHaveBeenCalledTimes(2);
      expect(mockPipeline.lpush).toHaveBeenNthCalledWith(
        1,
        redisConstant.FEED_AI_QUEUE,
        JSON.stringify({
          id: 1,
          content: feedsWithId[0].content,
          deathCount: feedsWithId[0].deathCount,
        }),
      );
      expect(mockPipeline.lpush).toHaveBeenNthCalledWith(
        2,
        redisConstant.FEED_AI_QUEUE,
        JSON.stringify({
          id: 2,
          content: feedsWithId[1].content,
          deathCount: feedsWithId[1].deathCount,
        }),
      );
    });

    it('Redis 에러를 올바르게 처리해야 한다', async () => {
      // Given
      const redisError = new Error('Redis connection failed');
      mockRedisConnection.executePipeline.mockRejectedValueOnce(redisError);
      const feedsWithId = mockFeedDetails.map((feed, index) => ({
        ...feed,
        id: index + 1,
      }));

      // When & Then
      await expect(
        feedRepository.saveAiQueue(feedsWithId),
      ).resolves.not.toThrow();
    });

    it('빈 피드 배열에 대해 파이프라인을 실행하지 않아야 한다', async () => {
      // When
      await feedRepository.saveAiQueue([]);

      // Then
      expect(mockRedisConnection.executePipeline).toHaveBeenCalledTimes(1);
      const pipelineCallback =
        mockRedisConnection.executePipeline.mock.calls[0][0];
      const mockPipeline = {
        lpush: jest.fn(),
      };
      pipelineCallback(mockPipeline);

      expect(mockPipeline.lpush).not.toHaveBeenCalled();
    });
  });
});


