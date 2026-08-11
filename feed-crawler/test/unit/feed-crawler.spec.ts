import 'reflect-metadata';

import axios from 'axios';

import { PermanentError, RetryableError } from '@common/errors';
import { FeedDetail, RssObj } from '@common/feed/feed.type';
import { FeedParserManager } from '@common/parser/feed-parser-manager';

import { RMQ_EXCHANGES, RMQ_ROUTING_KEYS } from '@rabbitmq/rabbitmq.constant';
import { RabbitMQService } from '@rabbitmq/rabbitmq.service';

import { FeedRepository } from '@repository/feed.repository';
import { RssRepository } from '@repository/rss.repository';

import { FeedCrawler } from '../../src/feed-crawler';

describe('FeedCrawler', () => {
  let feedCrawler: FeedCrawler;
  let mockFeedRepository: jest.Mocked<FeedRepository>;
  let mockRssRepository: jest.Mocked<RssRepository>;
  let mockFeedParserManager: jest.Mocked<FeedParserManager>;
  let mockRabbitMQService: jest.Mocked<RabbitMQService>;
  let deleteRecentFeedMock: jest.Mock;
  let insertFeedsMock: jest.Mock;
  let saveAiQueueMock: jest.Mock;
  let setRecentFeedListMock: jest.Mock;
  let selectAllRssMock: jest.Mock;
  let selectFeedByIdMock: jest.Mock;
  let selectRssByIdMock: jest.Mock;
  let updateImageMock: jest.Mock;
  let fetchAndParseMock: jest.Mock;
  let fetchAndParseAllMock: jest.Mock;
  let sendMessageMock: jest.Mock;

  const mockRssObjects: RssObj[] = [
    {
      id: 1,
      blogName: '테스트 블로그 1',
      blogPlatform: 'tistory',
      rssUrl: 'https://test1.tistory.com/rss',
      blogImage: null,
    },
    {
      id: 2,
      blogName: '테스트 블로그 2',
      blogPlatform: 'velog',
      rssUrl: 'https://velog.io/@test2/rss',
      blogImage: null,
    },
  ];

  const mockFeedDetails: FeedDetail[] = [
    {
      id: 1,
      blog: {
        id: 1,
        name: '테스트 블로그 1',
        platform: 'tistory',
        image: null,
      },
      pubDate: '2024-01-01 12:00:00',
      title: '테스트 피드 1',
      link: 'https://test1.tistory.com/1',
      thumbnail: 'https://test1.tistory.com/image1.jpg',
      content: '테스트 내용 1',
      summary: 'AI 요약 처리 중...',
      deathCount: 0,
    },
    {
      id: 2,
      blog: {
        id: 2,
        name: '테스트 블로그 2',
        platform: 'velog',
        image: null,
      },
      pubDate: '2024-01-01 12:30:00',
      title: '테스트 피드 2',
      link: 'https://velog.io/@test2/2',
      thumbnail: 'https://velog.io/image2.jpg',
      content: '테스트 내용 2',
      summary: 'AI 요약 처리 중...',
      deathCount: 0,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    deleteRecentFeedMock = jest.fn();
    insertFeedsMock = jest.fn();
    saveAiQueueMock = jest.fn();
    setRecentFeedListMock = jest.fn();
    selectAllRssMock = jest.fn();
    selectFeedByIdMock = jest.fn();
    selectRssByIdMock = jest.fn();
    updateImageMock = jest.fn();
    fetchAndParseMock = jest.fn();
    fetchAndParseAllMock = jest.fn();
    sendMessageMock = jest.fn();

    mockFeedRepository = {
      deleteRecentFeed: deleteRecentFeedMock,
      insertFeeds: insertFeedsMock,
      saveAiQueue: saveAiQueueMock,
      setRecentFeedList: setRecentFeedListMock,
      updateSummary: jest.fn(),
      updateNullSummary: jest.fn(),
      selectFeedById: selectFeedByIdMock,
    } as any;

    mockRssRepository = {
      selectAllRss: selectAllRssMock,
      selectRssById: selectRssByIdMock,
      updateImage: updateImageMock,
    } as any;

    mockFeedParserManager = {
      fetchAndParse: fetchAndParseMock,
      fetchAndParseAll: fetchAndParseAllMock,
    } as any;

    mockRabbitMQService = {
      sendMessage: sendMessageMock,
    } as any;

    feedCrawler = new FeedCrawler(
      mockRssRepository,
      mockFeedRepository,
      mockFeedParserManager,
      mockRabbitMQService,
    );
  });

  describe('start', () => {
    it('정상적인 크롤링 플로우를 실행해야 한다', async () => {
      // Given
      const startTime = new Date('2024-01-01T12:00:00Z');
      selectAllRssMock.mockResolvedValue(mockRssObjects);
      fetchAndParseMock
        .mockResolvedValueOnce({
          feeds: [mockFeedDetails[0]],
          channelImage: undefined,
        })
        .mockResolvedValueOnce({
          feeds: [mockFeedDetails[1]],
          channelImage: undefined,
        });
      insertFeedsMock.mockResolvedValue(mockFeedDetails);

      // When
      await feedCrawler.start(startTime);

      // Then
      expect(deleteRecentFeedMock).toHaveBeenCalledTimes(1);
      expect(selectAllRssMock).toHaveBeenCalledTimes(1);
      expect(fetchAndParseMock).toHaveBeenCalledTimes(2);
      expect(fetchAndParseMock).toHaveBeenNthCalledWith(
        1,
        mockRssObjects[0],
        startTime,
      );
      expect(fetchAndParseMock).toHaveBeenNthCalledWith(
        2,
        mockRssObjects[1],
        startTime,
      );
      expect(insertFeedsMock).toHaveBeenCalledWith(mockFeedDetails);
      expect(saveAiQueueMock).toHaveBeenCalledWith(mockFeedDetails);
      expect(setRecentFeedListMock).toHaveBeenCalledWith(mockFeedDetails);
      expect(sendMessageMock).toHaveBeenCalledWith(
        RMQ_EXCHANGES.CRAWLING,
        RMQ_ROUTING_KEYS.CRAWLING_NEW_POST,
        JSON.stringify(
          mockFeedDetails.map((feed) => ({
            feedId: feed.id,
            rssAcceptId: feed.blog.id,
          })),
        ),
      );
    });

    it('등록된 RSS가 없을 때 조기 종료해야 한다', async () => {
      // Given
      const startTime = new Date('2024-01-01T12:00:00Z');
      selectAllRssMock.mockResolvedValue([]);

      // When
      await feedCrawler.start(startTime);

      // Then
      expect(deleteRecentFeedMock).toHaveBeenCalledTimes(1);
      expect(selectAllRssMock).toHaveBeenCalledTimes(1);
      expect(fetchAndParseMock).not.toHaveBeenCalled();
      expect(insertFeedsMock).not.toHaveBeenCalled();
    });

    it('새로운 피드가 없을 때 조기 종료해야 한다', async () => {
      // Given
      const startTime = new Date('2024-01-01T12:00:00Z');
      selectAllRssMock.mockResolvedValue(mockRssObjects);
      fetchAndParseMock.mockResolvedValue({
        feeds: [],
        channelImage: undefined,
      });

      // When
      await feedCrawler.start(startTime);

      // Then
      expect(deleteRecentFeedMock).toHaveBeenCalledTimes(1);
      expect(selectAllRssMock).toHaveBeenCalledTimes(1);
      expect(fetchAndParseMock).toHaveBeenCalledTimes(2);
      expect(insertFeedsMock).not.toHaveBeenCalled();
    });

    it('RSS 객체가 null일 때 조기 종료해야 한다', async () => {
      // Given
      const startTime = new Date('2024-01-01T12:00:00Z');
      selectAllRssMock.mockResolvedValue(null);

      // When
      await feedCrawler.start(startTime);

      // Then
      expect(deleteRecentFeedMock).toHaveBeenCalledTimes(1);
      expect(selectAllRssMock).toHaveBeenCalledTimes(1);
      expect(fetchAndParseMock).not.toHaveBeenCalled();
    });
  });

  describe('startFullCrawl', () => {
    it('전체 크롤링을 정상적으로 실행해야 한다', async () => {
      // Given
      const rssObj = mockRssObjects[0];
      const expectedFeeds = [mockFeedDetails[0]];
      selectRssByIdMock.mockResolvedValue(rssObj);
      fetchAndParseAllMock.mockResolvedValue({
        feeds: expectedFeeds,
        channelImage: undefined,
      });
      insertFeedsMock.mockResolvedValue(expectedFeeds);

      // When
      const result = await feedCrawler.startFullCrawl(rssObj.id);

      // Then
      expect(fetchAndParseAllMock).toHaveBeenCalledWith(rssObj);
      expect(insertFeedsMock).toHaveBeenCalledWith(expectedFeeds);
      expect(saveAiQueueMock).toHaveBeenCalledWith(expectedFeeds);
      expect(result).toEqual(expectedFeeds);
      // 전체 크롤링(관리자 승인 시 백카탈로그)은 신규 글 알림을 발행하지 않아야 한다.
      expect(sendMessageMock).not.toHaveBeenCalled();
    });

    it('가져올 피드가 없을 때 빈 배열을 반환해야 한다', async () => {
      // Given
      const rssObj = mockRssObjects[0];
      selectRssByIdMock.mockResolvedValue(rssObj);
      fetchAndParseAllMock.mockResolvedValue({
        feeds: [],
        channelImage: undefined,
      });

      // When
      const result = await feedCrawler.startFullCrawl(rssObj.id);

      // Then
      expect(fetchAndParseAllMock).toHaveBeenCalledWith(rssObj);
      expect(insertFeedsMock).not.toHaveBeenCalled();
      expect(saveAiQueueMock).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('RSS를 찾을 수 없으면 크롤링하지 않고 빈 배열을 반환해야 한다', async () => {
      // Given
      selectRssByIdMock.mockResolvedValue(null);

      // When
      const result = await feedCrawler.startFullCrawl(999);

      // Then
      expect(fetchAndParseAllMock).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('feedGroupByRss', () => {
    it('모든 RSS 객체에 대해 병렬 처리해야 한다', async () => {
      // Given
      const startTime = new Date('2024-01-01T12:00:00Z');
      const callOrder: number[] = [];

      // 병렬 실행 검증: 첫 번째 호출에 지연을 주어 병렬 실행 시 순서가 뒤바뀌는지 확인
      fetchAndParseMock
        .mockImplementationOnce(async () => {
          await new Promise((resolve) => setTimeout(resolve, 50));
          callOrder.push(1);
          return { feeds: [mockFeedDetails[0]], channelImage: undefined };
        })
        .mockImplementationOnce(() => {
          callOrder.push(2);
          return Promise.resolve({
            feeds: [mockFeedDetails[1]],
            channelImage: undefined,
          });
        });

      // When
      const result = await feedCrawler['feedGroupByRss'](
        mockRssObjects,
        startTime,
      );

      // Then
      expect(fetchAndParseMock).toHaveBeenCalledTimes(2);
      expect(result).toEqual([
        { feeds: [mockFeedDetails[0]], channelImage: undefined, rssId: 1 },
        { feeds: [mockFeedDetails[1]], channelImage: undefined, rssId: 2 },
      ]);
      // 병렬 실행이면 지연이 없는 두 번째가 먼저 완료됨
      expect(callOrder).toEqual([2, 1]);
    });

    it('빈 RSS 배열에 대해 빈 결과를 반환해야 한다', async () => {
      // Given
      const startTime = new Date('2024-01-01T12:00:00Z');

      // When
      const result = await feedCrawler['feedGroupByRss']([], startTime);

      // Then
      expect(fetchAndParseMock).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('requeueFeedForAiSummary', () => {
    const mockFeed = { id: 10, blogId: 1, path: 'https://test1.tistory.com/1' };
    let axiosGetSpy: jest.SpyInstance;

    afterEach(() => {
      axiosGetSpy?.mockRestore();
    });

    it('RSS에서 매칭되는 게시글을 찾으면 AI 큐에 다시 넣어야 한다', async () => {
      // Given
      selectFeedByIdMock.mockResolvedValue(mockFeed);
      selectRssByIdMock.mockResolvedValue(mockRssObjects[0]);
      fetchAndParseAllMock.mockResolvedValue({
        feeds: [{ ...mockFeedDetails[0], link: mockFeed.path }],
        channelImage: undefined,
      });

      // When
      await feedCrawler.requeueFeedForAiSummary(mockFeed.id);

      // Then
      expect(selectFeedByIdMock).toHaveBeenCalledWith(mockFeed.id);
      expect(selectRssByIdMock).toHaveBeenCalledWith(mockFeed.blogId);
      expect(saveAiQueueMock).toHaveBeenCalledWith([
        expect.objectContaining({ id: mockFeed.id, deathCount: 0 }),
      ]);
    });

    it('피드를 찾을 수 없으면 PermanentError를 던져야 한다', async () => {
      // Given
      selectFeedByIdMock.mockResolvedValue(null);

      // When & Then
      await expect(
        feedCrawler.requeueFeedForAiSummary(mockFeed.id),
      ).rejects.toThrow(PermanentError);
      expect(saveAiQueueMock).not.toHaveBeenCalled();
    });

    it('RSS를 찾을 수 없으면 PermanentError를 던져야 한다', async () => {
      // Given
      selectFeedByIdMock.mockResolvedValue(mockFeed);
      selectRssByIdMock.mockResolvedValue(null);

      // When & Then
      await expect(
        feedCrawler.requeueFeedForAiSummary(mockFeed.id),
      ).rejects.toThrow(PermanentError);
      expect(saveAiQueueMock).not.toHaveBeenCalled();
    });

    describe('RSS에 매칭되는 게시글이 없을 때', () => {
      beforeEach(() => {
        selectFeedByIdMock.mockResolvedValue(mockFeed);
        selectRssByIdMock.mockResolvedValue(mockRssObjects[0]);
        // 다른 link만 반환하여 매칭 실패 유도
        fetchAndParseAllMock.mockResolvedValue({
          feeds: [
            { ...mockFeedDetails[0], link: 'https://other.com/different' },
          ],
          channelImage: undefined,
        });
      });

      it('원본 HTTP 200이면 PermanentError를 던져야 한다 (오래된 게시글)', async () => {
        // Given
        axiosGetSpy = jest
          .spyOn(axios, 'get')
          .mockResolvedValue({ status: 200 });

        // When & Then
        await expect(
          feedCrawler.requeueFeedForAiSummary(mockFeed.id),
        ).rejects.toThrow(PermanentError);
        expect(saveAiQueueMock).not.toHaveBeenCalled();
      });

      it('원본 HTTP 404이면 PermanentError를 던져야 한다 (삭제된 게시글)', async () => {
        // Given
        axiosGetSpy = jest
          .spyOn(axios, 'get')
          .mockResolvedValue({ status: 404 });

        // When & Then
        await expect(
          feedCrawler.requeueFeedForAiSummary(mockFeed.id),
        ).rejects.toThrow(PermanentError);
      });

      it('원본 HTTP 500이면 RetryableError를 던져야 한다 (일시적 서버 오류)', async () => {
        // Given
        axiosGetSpy = jest
          .spyOn(axios, 'get')
          .mockResolvedValue({ status: 500 });

        // When & Then
        await expect(
          feedCrawler.requeueFeedForAiSummary(mockFeed.id),
        ).rejects.toThrow(RetryableError);
      });

      it('원본 요청이 네트워크 에러로 실패하면 RetryableError를 던져야 한다', async () => {
        // Given
        axiosGetSpy = jest
          .spyOn(axios, 'get')
          .mockRejectedValue(new Error('ECONNREFUSED'));

        // When & Then
        await expect(
          feedCrawler.requeueFeedForAiSummary(mockFeed.id),
        ).rejects.toThrow(RetryableError);
      });
    });
  });
});
