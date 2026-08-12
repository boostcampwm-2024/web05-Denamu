import 'reflect-metadata';

import { ClaudeResponse, FeedAIQueueItem } from '@common/ai/ai.type';
import { PermanentError, RetryableError } from '@common/errors';
import { AiMetrics } from '@common/metrics/ai-metrics';
import { RedisMetrics } from '@common/metrics/redis-metrics';
import { RedisConnection } from '@common/redis/redis-access';
import { redisConstant } from '@common/redis/redis.constant';

import { ClaudeEventWorker } from '@event_worker/workers/claude-event-worker';

import { FeedRepository } from '@repository/feed.repository';
import { TagMapRepository } from '@repository/tag-map.repository';
import { TagRepository } from '@repository/tag.repository';

describe('ClaudeEventWorker', () => {
  let claudeEventWorker: ClaudeEventWorker;
  let mockTagMapRepository: jest.Mocked<TagMapRepository>;
  let mockTagRepository: jest.Mocked<TagRepository>;
  let mockFeedRepository: jest.Mocked<FeedRepository>;
  let mockRedisConnection: jest.Mocked<RedisConnection>;
  let mockAnthropicClient: any;
  let insertTagsMock: jest.Mock;
  let updateSummaryMock: jest.Mock;
  let updateNullSummaryMock: jest.Mock;
  let executePipelineMock: jest.Mock;
  let hsetMock: jest.Mock;
  let existsMock: jest.Mock;
  let rpushMock: jest.Mock;
  let messagesCreateMock: jest.Mock;

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

    insertTagsMock = jest.fn();
    updateSummaryMock = jest.fn();
    updateNullSummaryMock = jest.fn();
    executePipelineMock = jest.fn();
    hsetMock = jest.fn();
    existsMock = jest.fn().mockResolvedValue(true);
    rpushMock = jest.fn();
    messagesCreateMock = jest.fn();

    mockTagMapRepository = {
      insertTags: insertTagsMock,
    } as any;

    mockTagRepository = {
      findAllNames: jest.fn().mockResolvedValue(['JavaScript', 'React']),
    } as any;

    mockFeedRepository = {
      updateSummary: updateSummaryMock,
      updateNullSummary: updateNullSummaryMock,
    } as any;

    mockRedisConnection = {
      executePipeline: executePipelineMock,
      hset: hsetMock,
      exists: existsMock,
      rpush: rpushMock,
      llen: jest.fn().mockResolvedValue(0),
    } as any;

    mockAnthropicClient = {
      messages: {
        create: messagesCreateMock,
      },
    };

    const mockAiMetrics = {
      total: { inc: jest.fn() },
      success: { inc: jest.fn() },
      failure: { inc: jest.fn() },
      permanentFailure: { inc: jest.fn() },
      queueDepth: { set: jest.fn() },
      duration: { startTimer: jest.fn().mockReturnValue(jest.fn()) },
    } as unknown as AiMetrics;

    const mockRedisMetrics = {
      total: { inc: jest.fn() },
      success: { inc: jest.fn() },
      failure: { inc: jest.fn() },
    } as unknown as RedisMetrics;

    claudeEventWorker = new ClaudeEventWorker(
      mockTagMapRepository,
      mockTagRepository,
      mockFeedRepository,
      mockRedisConnection,
      mockAiMetrics,
      mockRedisMetrics,
    );
    Object.assign(claudeEventWorker, { client: mockAnthropicClient });
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
      executePipelineMock.mockResolvedValue(mockRedisResults as any);

      // When
      const result = await claudeEventWorker['loadFeeds']();

      // Then
      expect(executePipelineMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockFeedAIQueueItem]);
    });

    it('malformed 메시지는 스킵하고 나머지를 반환해야 한다 (poison message 격리)', async () => {
      // Given
      const mockRedisResults = [
        [null, 'invalid-json'],
        [null, JSON.stringify(mockFeedAIQueueItem)],
      ];
      executePipelineMock.mockResolvedValue(mockRedisResults as any);

      // When
      const result = await claudeEventWorker['loadFeeds']();

      // Then
      expect(result).toEqual([mockFeedAIQueueItem]);
    });

    it('파이프라인 실패 시 빈 배열을 반환해야 한다', async () => {
      // Given
      executePipelineMock.mockRejectedValue(new Error('redis down'));

      // When
      const result = await claudeEventWorker['loadFeeds']();

      // Then
      expect(result).toEqual([]);
    });
  });

  describe('requestAI', () => {
    it('Anthropic API를 호출하고 응답을 처리해야 한다', async () => {
      // Given
      const mockMessage = {
        content: [{ text: JSON.stringify(mockClaudeResponse) }],
      };
      messagesCreateMock.mockResolvedValue(mockMessage as any);

      // When
      const result = await claudeEventWorker['requestAI'](mockFeedAIQueueItem);

      // Then
      expect(messagesCreateMock).toHaveBeenCalledWith({
        max_tokens: 8192,
        system: [
          {
            type: 'text',
            text: expect.any(String),
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{ role: 'user', content: mockFeedAIQueueItem.content }],
        model: 'claude-haiku-4-5',
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
      messagesCreateMock.mockResolvedValue(mockMessage as any);

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
      expect(insertTagsMock).toHaveBeenCalledWith(
        feedWithAIResult.id,
        feedWithAIResult.tagList,
      );
      expect(hsetMock).toHaveBeenCalledWith(
        `feed:recent:${feedWithAIResult.id}`,
        'tagList',
        feedWithAIResult.tagList.join(','),
        'summary',
        feedWithAIResult.summary,
      );
      expect(updateSummaryMock).toHaveBeenCalledWith(
        feedWithAIResult.id,
        feedWithAIResult.summary,
      );
    });

    it('캐시에 없는 게시글이면 hset을 호출하지 않아야 한다', async () => {
      // Given
      existsMock.mockResolvedValue(false);
      const feedWithAIResult = {
        ...mockFeedAIQueueItem,
        summary: mockClaudeResponse.summary,
        tagList: Object.keys(mockClaudeResponse.tags),
      };

      // When
      await claudeEventWorker['saveAIResult'](feedWithAIResult);

      // Then
      expect(hsetMock).not.toHaveBeenCalled();
      expect(updateSummaryMock).toHaveBeenCalledWith(
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
      expect(rpushMock).toHaveBeenCalledWith(redisConstant.FEED_AI_QUEUE, [
        JSON.stringify({ ...feedWithLowDeathCount, deathCount: 2 }),
      ]);
      expect(updateNullSummaryMock).not.toHaveBeenCalled();
    });

    it('deathCount가 3 이상일 때 null summary로 업데이트해야 한다', async () => {
      // Given
      const feedWithHighDeathCount = { ...mockFeedAIQueueItem, deathCount: 3 };
      const error = new Error('처리 실패');

      // When
      await claudeEventWorker['handleFailure'](feedWithHighDeathCount, error);

      // Then
      expect(rpushMock).not.toHaveBeenCalled();
      expect(updateNullSummaryMock).toHaveBeenCalledWith(
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
      expect(rpushMock).not.toHaveBeenCalled();
      expect(updateNullSummaryMock).toHaveBeenCalledWith(
        feedWithExactDeathCount.id,
      );
    });

    it('PermanentError는 deathCount와 무관하게 재시도 없이 영구 실패 처리해야 한다', async () => {
      // Given - 재시도 여유가 있어도(0/3) 영구 에러면 재시도 금지
      const feed = { ...mockFeedAIQueueItem, deathCount: 0 };
      const error = new PermanentError('삭제된 게시글 (원본 HTTP 404)');

      // When
      await claudeEventWorker['handleFailure'](feed, error);

      // Then
      expect(rpushMock).not.toHaveBeenCalled();
      expect(updateNullSummaryMock).toHaveBeenCalledWith(feed.id);
    });

    it('RetryableError(json 파싱 실패)는 재시도 큐에 재투입해야 한다', async () => {
      // Given - LLM 비결정 출력은 재요청 시 회복 가능
      const feed = { ...mockFeedAIQueueItem, deathCount: 0 };
      const error = new RetryableError(
        'AI 응답이 json으로 반환되지 않았습니다',
      );

      // When
      await claudeEventWorker['handleFailure'](feed, error);

      // Then
      expect(rpushMock).toHaveBeenCalledWith(redisConstant.FEED_AI_QUEUE, [
        JSON.stringify({ ...feed, deathCount: 1 }),
      ]);
      expect(updateNullSummaryMock).not.toHaveBeenCalled();
    });

    it('deathCount가 정확히 2일 때 재시도해야 한다 (경계값-1)', async () => {
      // Given - 경계값 바로 아래 (2 < 3이므로 재시도)
      const feedWithDeathCount2 = { ...mockFeedAIQueueItem, deathCount: 2 };
      const error = new Error('처리 실패');

      // When
      await claudeEventWorker['handleFailure'](feedWithDeathCount2, error);

      // Then
      expect(rpushMock).toHaveBeenCalledWith(redisConstant.FEED_AI_QUEUE, [
        JSON.stringify({ ...feedWithDeathCount2, deathCount: 3 }),
      ]);
      expect(updateNullSummaryMock).not.toHaveBeenCalled();
    });
  });

  describe('getQueueKey', () => {
    it('AI 큐 키를 반환해야 한다', () => {
      expect(claudeEventWorker['getQueueKey']()).toBe(
        redisConstant.FEED_AI_QUEUE,
      );
    });
  });

  describe('loadFeeds 파이프라인', () => {
    it('AI_RATE_LIMIT_COUNT만큼 rpop을 파이프라인에 등록해야 한다', async () => {
      // Given
      process.env.AI_RATE_LIMIT_COUNT = '3';
      const pipelineRpop = jest.fn();
      executePipelineMock.mockImplementation((cb: (pipeline: any) => void) => {
        cb({ rpop: pipelineRpop });
        return Promise.resolve([]);
      });

      // When
      await claudeEventWorker['loadFeeds']();

      // Then
      expect(pipelineRpop).toHaveBeenCalledTimes(3);
      expect(pipelineRpop).toHaveBeenCalledWith(redisConstant.FEED_AI_QUEUE);
    });
  });

  describe('requestAI 실패 처리', () => {
    it('Anthropic API 호출이 실패하면 에러를 전파해야 한다', async () => {
      // Given
      messagesCreateMock.mockRejectedValue(new Error('API down'));

      // When & Then
      await expect(
        claudeEventWorker['requestAI'](mockFeedAIQueueItem),
      ).rejects.toThrow('API down');
    });

    it('응답에 JSON이 없으면 RetryableError를 던져야 한다', async () => {
      // Given
      messagesCreateMock.mockResolvedValue({
        content: [{ text: 'JSON이 아닌 응답' }],
      } as any);

      // When & Then
      await expect(
        claudeEventWorker['requestAI'](mockFeedAIQueueItem),
      ).rejects.toThrow(RetryableError);
    });
  });

  describe('saveAIResult 실패 처리', () => {
    it('Redis hset이 실패하면 에러를 전파해야 한다', async () => {
      // Given
      const feedWithAIResult = {
        ...mockFeedAIQueueItem,
        summary: mockClaudeResponse.summary,
        tagList: Object.keys(mockClaudeResponse.tags),
      };
      hsetMock.mockRejectedValue(new Error('redis down'));

      // When & Then
      await expect(
        claudeEventWorker['saveAIResult'](feedWithAIResult),
      ).rejects.toThrow('redis down');
      expect(updateSummaryMock).not.toHaveBeenCalled();
    });
  });

  describe('pushToRetryQueue 실패 처리', () => {
    it('재시도 큐 재투입이 실패하면 에러를 전파해야 한다', async () => {
      // Given
      rpushMock.mockRejectedValue(new Error('redis down'));

      // When & Then
      await expect(
        claudeEventWorker['pushToRetryQueue'](mockFeedAIQueueItem),
      ).rejects.toThrow('redis down');
      expect(rpushMock).toHaveBeenCalledWith(redisConstant.FEED_AI_QUEUE, [
        JSON.stringify(mockFeedAIQueueItem),
      ]);
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
      executePipelineMock.mockResolvedValue(
        mockFeeds.map((feed) => [null, JSON.stringify(feed)]) as any,
      );

      // When
      await claudeEventWorker['loadFeeds']();

      // Then
      // AI_RATE_LIMIT_COUNT가 2이므로 최대 2개만 로드
      expect(executePipelineMock).toHaveBeenCalledTimes(1);
    });
  });
});
