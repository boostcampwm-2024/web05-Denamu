import 'reflect-metadata';

import { AiSummaryRetryMessage } from '@common/ai/ai.type';
import logger from '@common/logger/logger';
import { RedisConnection } from '@common/redis/redis-access';
import { redisConstant } from '@common/redis/redis.constant';

import { AiSummaryRetryEventWorker } from '@event_worker/workers/ai-summary-retry-event-worker';

import { FeedCrawler } from '../../src/feed-crawler';

describe('AiSummaryRetryEventWorker', () => {
  let worker: AiSummaryRetryEventWorker;
  let mockRedisConnection: jest.Mocked<RedisConnection>;
  let mockFeedCrawler: jest.Mocked<FeedCrawler>;
  let rpopMock: jest.Mock;
  let delMock: jest.Mock;
  let requeueMock: jest.Mock;

  const retryMessage: AiSummaryRetryMessage = { feedId: 7, deathCount: 0 };

  beforeEach(() => {
    rpopMock = jest.fn();
    delMock = jest.fn();
    requeueMock = jest.fn();

    mockRedisConnection = {
      rpop: rpopMock,
      del: delMock,
      rpush: jest.fn(),
    } as any;

    mockFeedCrawler = {
      requeueFeedForAiSummary: requeueMock,
    } as any;

    worker = new AiSummaryRetryEventWorker(
      mockRedisConnection,
      mockFeedCrawler,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processQueue', () => {
    it('큐가 비어있으면 처리하지 않아야 한다', async () => {
      // Given
      rpopMock.mockResolvedValue(null);

      // When
      await worker['processQueue']();

      // Then
      expect(requeueMock).not.toHaveBeenCalled();
    });

    it('메시지가 있으면 파싱하여 processItem을 호출해야 한다', async () => {
      // Given
      rpopMock.mockResolvedValue(JSON.stringify(retryMessage));
      const processItemSpy = jest
        .spyOn(worker as any, 'processItem')
        .mockResolvedValue(undefined);

      // When
      await worker['processQueue']();

      // Then
      expect(rpopMock).toHaveBeenCalledWith(redisConstant.FEED_AI_RETRY_QUEUE);
      expect(processItemSpy).toHaveBeenCalledWith(retryMessage);
    });
  });

  describe('processItem', () => {
    it('feedCrawler.requeueFeedForAiSummary를 호출해야 한다', async () => {
      // Given
      requeueMock.mockResolvedValue(undefined);

      // When
      await worker['processItem'](retryMessage);

      // Then
      expect(requeueMock).toHaveBeenCalledWith(retryMessage.feedId);
    });

    it('에러 발생 시 handleFailure를 호출해야 한다', async () => {
      // Given
      const error = new Error('재요청 실패');
      requeueMock.mockRejectedValue(error);
      const handleFailureSpy = jest
        .spyOn(worker as any, 'handleFailure')
        .mockResolvedValue(undefined);

      // When
      await worker['processItem'](retryMessage);

      // Then
      expect(handleFailureSpy).toHaveBeenCalledWith(retryMessage, error);
    });
  });

  describe('onPermanentFailure', () => {
    it('영구 실패 시 재요청 락을 해제해야 한다', async () => {
      // Given
      delMock.mockResolvedValue(undefined);

      // When
      await worker['onPermanentFailure'](retryMessage);

      // Then
      expect(delMock).toHaveBeenCalledWith(
        `${redisConstant.FEED_AI_RETRY_LOCK}:${retryMessage.feedId}`,
      );
    });

    it('락 해제가 실패해도 예외를 던지지 않고 로깅해야 한다', async () => {
      // Given
      const errorSpy = jest.spyOn(logger, 'error').mockImplementation();
      delMock.mockRejectedValue(new Error('redis down'));

      // When & Then
      await expect(
        worker['onPermanentFailure'](retryMessage),
      ).resolves.toBeUndefined();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('AI 재요청 락 해제 실패'),
      );
    });
  });

  describe('queue key accessors', () => {
    it('getQueueKey와 getRetryQueueKey는 AI 재시도 큐를 반환해야 한다', () => {
      expect(worker['getQueueKey']()).toBe(redisConstant.FEED_AI_RETRY_QUEUE);
      expect(worker['getRetryQueueKey']()).toBe(
        redisConstant.FEED_AI_RETRY_QUEUE,
      );
    });

    it('getItemLabel은 feedId를 포함해야 한다', () => {
      expect(worker['getItemLabel'](retryMessage)).toBe(
        `feedId ${retryMessage.feedId}`,
      );
    });

    it('parseQueueMessage는 JSON을 파싱해야 한다', () => {
      expect(worker['parseQueueMessage'](JSON.stringify(retryMessage))).toEqual(
        retryMessage,
      );
    });
  });
});
