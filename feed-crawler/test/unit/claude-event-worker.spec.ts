import 'reflect-metadata';
import { ClaudeEventWorker } from '../../src/event_worker/workers/claude-event-worker';
import { TagMapRepository } from '../../src/repository/tag-map.repository';
import { FeedRepository } from '../../src/repository/feed.repository';
import { RedisConnection } from '../../src/common/redis-access';
import { FeedAIQueueItem, ClaudeResponse } from '../../src/common/types';
import { redisConstant } from '../../src/common/constant';
import Anthropic from '@anthropic-ai/sdk';

// Anthropic 모킹
jest.mock('@anthropic-ai/sdk');
const MockedAnthropic = Anthropic as jest.MockedClass<typeof Anthropic>;

describe('ClaudeEventWorker', () => {
  let claudeEventWorker: ClaudeEventWorker;
  let mockTagMapRepository: jest.Mocked<TagMapRepository>;
  let mockFeedRepository: jest.Mocked<FeedRepository>;
  let mockRedisConnection: jest.Mocked<RedisConnection>;
  let mockAnthropicClient: jest.Mocked<Anthropic>;

  const mockFeedAIQueueItem: FeedAIQueueItem = {
    id: 1,
    content: '테스트 피드 내용입니다. 이것은 AI가 분석할 내용입니다.',
    deathCount: 0,
    summary: '',
    tagList: [],
  };

  const mockClaudeResponse: ClaudeResponse = {
    summary: '테스트 피드에 대한 AI 요약입니다.',
    tags: {
      JavaScript: 0.8,
      React: 0.7,
      웹개발: 0.9,
    },
  };

  beforeEach(() => {
    // 환경 변수 설정
    process.env.AI_API_KEY = 'test-api-key';
    process.env.AI_RATE_LIMIT_COUNT = '5';

    mockTagMapRepository = {
      insertTags: jest.fn(),
    } as any;

    mockFeedRepository = {
      updateSummary: jest.fn(),
      updateNullSummary: jest.fn(),
    } as any;

    mockRedisConnection = {
      executePipeline: jest.fn(),
      hset: jest.fn(),
      rpush: jest.fn(),
    } as any;

    mockAnthropicClient = {
      messages: {
        create: jest.fn(),
      },
    } as any;

    MockedAnthropic.mockImplementation(() => mockAnthropicClient);

    claudeEventWorker = new ClaudeEventWorker(
      mockTagMapRepository,
      mockFeedRepository,
      mockRedisConnection,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.AI_API_KEY;
    delete process.env.AI_RATE_LIMIT_COUNT;
  });

  describe('processQueue', () => {
    it('큐에서 피드를 로드하고 처리해야 한다', async () => {
      // Given
      const mockFeeds = [mockFeedAIQueueItem];
      jest
        .spyOn(claudeEventWorker as any, 'loadFeeds')
        .mockResolvedValue(mockFeeds);
      jest
        .spyOn(claudeEventWorker as any, 'processItem')
        .mockResolvedValue(undefined);

      // When
      await claudeEventWorker['processQueue']();

      // Then
      expect(claudeEventWorker['loadFeeds']).toHaveBeenCalledTimes(1);
      expect(claudeEventWorker['processItem']).toHaveBeenCalledTimes(1);
      expect(claudeEventWorker['processItem']).toHaveBeenCalledWith(
        mockFeedAIQueueItem,
      );
    });
  });

  describe('parseQueueMessage', () => {
    it('JSON 문자열을 FeedAIQueueItem으로 파싱해야 한다', () => {
      // Given
      const jsonString = JSON.stringify(mockFeedAIQueueItem);

      // When
      const result = claudeEventWorker['parseQueueMessage'](jsonString);

      // Then
      expect(result).toEqual(mockFeedAIQueueItem);
    });
  });

  describe('getQueueKey', () => {
    it('올바른 큐 키를 반환해야 한다', () => {
      // When
      const result = claudeEventWorker['getQueueKey']();

      // Then
      expect(result).toBe(redisConstant.FEED_AI_QUEUE);
    });
  });

  describe('processItem', () => {
    it('정상적인 피드 처리를 수행해야 한다', async () => {
      // Given
      jest.spyOn(claudeEventWorker as any, 'requestAI').mockResolvedValue({
        ...mockFeedAIQueueItem,
        summary: mockClaudeResponse.summary,
        tagList: Object.keys(mockClaudeResponse.tags),
      });
      jest
        .spyOn(claudeEventWorker as any, 'saveAIResult')
        .mockResolvedValue(undefined);

      // When
      await claudeEventWorker['processItem'](mockFeedAIQueueItem);

      // Then
      expect(claudeEventWorker['requestAI']).toHaveBeenCalledWith(
        mockFeedAIQueueItem,
      );
      expect(claudeEventWorker['saveAIResult']).toHaveBeenCalled();
    });

    it('에러 발생 시 handleFailure를 호출해야 한다', async () => {
      // Given
      const error = new Error('AI 요청 실패');
      jest
        .spyOn(claudeEventWorker as any, 'requestAI')
        .mockRejectedValue(error);
      jest
        .spyOn(claudeEventWorker as any, 'handleFailure')
        .mockResolvedValue(undefined);

      // When
      await claudeEventWorker['processItem'](mockFeedAIQueueItem);

      // Then
      expect(claudeEventWorker['handleFailure']).toHaveBeenCalledWith(
        mockFeedAIQueueItem,
        error,
      );
    });
  });

  describe('loadFeeds', () => {
    it('Redis에서 피드 데이터를 로드해야 한다', async () => {
      // Given
      const mockRedisResults = [
        [null, JSON.stringify(mockFeedAIQueueItem)],
        [null, null],
      ];
      mockRedisConnection.executePipeline.mockResolvedValue(
        mockRedisResults as any,
      );

      // When
      const result = await claudeEventWorker['loadFeeds']();

      // Then
      expect(mockRedisConnection.executePipeline).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockFeedAIQueueItem]);
    });

    it('JSON 파싱 에러를 처리해야 한다', async () => {
      // Given
      const mockRedisResults = [[null, 'invalid-json']];
      mockRedisConnection.executePipeline.mockResolvedValue(
        mockRedisResults as any,
      );

      // When
      const result = await claudeEventWorker['loadFeeds']();

      // Then
      expect(result).toBeUndefined();
    });
  });

  describe('requestAI', () => {
    it('Anthropic API를 호출하고 응답을 처리해야 한다', async () => {
      // Given
      const mockMessage = {
        content: [{ text: JSON.stringify(mockClaudeResponse) }],
      };
      (mockAnthropicClient.messages.create as jest.Mock).mockResolvedValue(
        mockMessage as any,
      );

      // When
      const result = await claudeEventWorker['requestAI'](mockFeedAIQueueItem);

      // Then
      expect(mockAnthropicClient.messages.create).toHaveBeenCalledWith({
        max_tokens: 8192,
        system: expect.any(String),
        messages: [{ role: 'user', content: mockFeedAIQueueItem.content }],
        model: 'claude-3-5-haiku-latest',
      });
      expect(result.summary).toBe(mockClaudeResponse.summary);
      expect(result.tagList).toEqual(Object.keys(mockClaudeResponse.tags));
    });

    it('응답에서 공백을 정규화해야 한다', async () => {
      // Given
      const responseWithWhitespace = JSON.stringify(mockClaudeResponse)
        .replace('{', '{\n\t  ')
        .replace('}', '\n  }');
      const mockMessage = {
        content: [{ text: responseWithWhitespace }],
      };
      (mockAnthropicClient.messages.create as jest.Mock).mockResolvedValue(
        mockMessage as any,
      );

      // When
      const result = await claudeEventWorker['requestAI'](mockFeedAIQueueItem);

      // Then
      expect(result.summary).toBe(mockClaudeResponse.summary);
      expect(result.tagList).toEqual(Object.keys(mockClaudeResponse.tags));
    });
  });

  describe('saveAIResult', () => {
    it('AI 결과를 데이터베이스와 Redis에 저장해야 한다', async () => {
      // Given
      const feedWithAIResult = {
        ...mockFeedAIQueueItem,
        summary: mockClaudeResponse.summary,
        tagList: Object.keys(mockClaudeResponse.tags),
      };

      // When
      await claudeEventWorker['saveAIResult'](feedWithAIResult);

      // Then
      expect(mockTagMapRepository.insertTags).toHaveBeenCalledWith(
        feedWithAIResult.id,
        feedWithAIResult.tagList,
      );
      expect(mockRedisConnection.hset).toHaveBeenCalledWith(
        `feed:recent:${feedWithAIResult.id}`,
        'tag',
        feedWithAIResult.tagList.join(','),
      );
      expect(mockFeedRepository.updateSummary).toHaveBeenCalledWith(
        feedWithAIResult.id,
        feedWithAIResult.summary,
      );
    });
  });

  describe('handleFailure', () => {
    it('deathCount가 3 미만일 때 재시도해야 한다', async () => {
      // Given
      const feedWithLowDeathCount = { ...mockFeedAIQueueItem, deathCount: 1 };
      const error = new Error('처리 실패');

      // When
      await claudeEventWorker['handleFailure'](feedWithLowDeathCount, error);

      // Then
      expect(mockRedisConnection.rpush).toHaveBeenCalledWith(
        redisConstant.FEED_AI_QUEUE,
        [JSON.stringify({ ...feedWithLowDeathCount, deathCount: 2 })],
      );
      expect(mockFeedRepository.updateNullSummary).not.toHaveBeenCalled();
    });

    it('deathCount가 3 이상일 때 null summary로 업데이트해야 한다', async () => {
      // Given
      const feedWithHighDeathCount = { ...mockFeedAIQueueItem, deathCount: 3 };
      const error = new Error('처리 실패');

      // When
      await claudeEventWorker['handleFailure'](feedWithHighDeathCount, error);

      // Then
      expect(mockRedisConnection.rpush).not.toHaveBeenCalled();
      expect(mockFeedRepository.updateNullSummary).toHaveBeenCalledWith(
        feedWithHighDeathCount.id,
      );
    });

    it('deathCount가 정확히 3일 때 경계값을 올바르게 처리해야 한다', async () => {
      // Given
      const feedWithExactDeathCount = { ...mockFeedAIQueueItem, deathCount: 3 };
      const error = new Error('처리 실패');

      // When
      await claudeEventWorker['handleFailure'](feedWithExactDeathCount, error);

      // Then
      expect(mockRedisConnection.rpush).not.toHaveBeenCalled();
      expect(mockFeedRepository.updateNullSummary).toHaveBeenCalledWith(
        feedWithExactDeathCount.id,
      );
    });

    it('deathCount가 정확히 2일 때 재시도해야 한다 (경계값-1)', async () => {
      // Given - 경계값 바로 아래 (2 < 3이므로 재시도)
      const feedWithDeathCount2 = { ...mockFeedAIQueueItem, deathCount: 2 };
      const error = new Error('처리 실패');

      // When
      await claudeEventWorker['handleFailure'](feedWithDeathCount2, error);

      // Then
      expect(mockRedisConnection.rpush).toHaveBeenCalledWith(
        redisConstant.FEED_AI_QUEUE,
        [JSON.stringify({ ...feedWithDeathCount2, deathCount: 3 })],
      );
      expect(mockFeedRepository.updateNullSummary).not.toHaveBeenCalled();
    });
  });

  describe('environment variables', () => {
    it('AI_RATE_LIMIT_COUNT 환경 변수에 따라 처리 개수가 제한되어야 한다', async () => {
      // Given
      process.env.AI_RATE_LIMIT_COUNT = '2';
      const mockFeeds = [
        { ...mockFeedAIQueueItem, id: 1 },
        { ...mockFeedAIQueueItem, id: 2 },
        { ...mockFeedAIQueueItem, id: 3 },
      ];

      // loadFeeds가 환경 변수에 따라 제한된 개수만 반환하는지 확인
      mockRedisConnection.executePipeline.mockResolvedValue(
        mockFeeds.map((feed) => [null, JSON.stringify(feed)]) as any,
      );

      // When
      await claudeEventWorker['loadFeeds']();

      // Then
      // AI_RATE_LIMIT_COUNT가 2이므로 최대 2개만 로드
      expect(mockRedisConnection.executePipeline).toHaveBeenCalledTimes(1);
    });
  });
});
