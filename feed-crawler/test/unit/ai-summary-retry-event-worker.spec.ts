import 'reflect-metadata';

import logger from '@common/logger/logger';
import { RedisConnection } from '@common/redis/redis-access';
import { redisConstant } from '@common/redis/redis.constant';

import { AiSummaryRetryEventWorker } from '@event_worker/workers/ai-summary-retry-event-worker';

import { RMQ_QUEUES } from '@rabbitmq/rabbitmq.constant';
import { RabbitMQService } from '@rabbitmq/rabbitmq.service';

import { FeedCrawler } from '../../src/feed-crawler';

describe('AiSummaryRetryEventWorker', () => {
  let worker: AiSummaryRetryEventWorker;
  let mockRabbitMQService: jest.Mocked<RabbitMQService>;
  let mockRedisConnection: jest.Mocked<RedisConnection>;
  let mockFeedCrawler: jest.Mocked<FeedCrawler>;
  let consumeMessageMock: jest.Mock;
  let closeConsumerMock: jest.Mock;
  let delMock: jest.Mock;
  let requeueMock: jest.Mock;

  const feedId = 7;

  beforeEach(() => {
    consumeMessageMock = jest.fn().mockResolvedValue('consumer-tag');
    closeConsumerMock = jest.fn();
    delMock = jest.fn();
    requeueMock = jest.fn();

    mockRabbitMQService = {
      consumeMessage: consumeMessageMock,
      closeConsumer: closeConsumerMock,
    } as any;

    mockRedisConnection = {
      del: delMock,
    } as any;

    mockFeedCrawler = {
      requeueFeedForAiSummary: requeueMock,
    } as any;

    worker = new AiSummaryRetryEventWorker(
      mockRabbitMQService,
      mockRedisConnection,
      mockFeedCrawler,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('start', () => {
    it('crawling.aiRetry.queue를 리스닝해야 한다', async () => {
      // When
      await worker.start();

      // Then
      expect(consumeMessageMock).toHaveBeenCalledWith(
        RMQ_QUEUES.CRAWLING_AI_RETRY,
        expect.any(Function),
      );
    });
  });

  describe('stop', () => {
    it('시작 후 종료하면 consumer를 취소해야 한다', async () => {
      // Given
      await worker.start();

      // When
      await worker.stop();

      // Then
      expect(closeConsumerMock).toHaveBeenCalledWith('consumer-tag');
    });
  });

  describe('processItem (private)', () => {
    it('feedCrawler.requeueFeedForAiSummary를 호출해야 한다', async () => {
      // Given
      requeueMock.mockResolvedValue(undefined);

      // When
      await worker['processItem'](feedId);

      // Then
      expect(requeueMock).toHaveBeenCalledWith(feedId);
    });

    it('에러 발생 시 handleFailure를 호출해야 한다', async () => {
      // Given
      const error = new Error('재요청 실패');
      requeueMock.mockRejectedValue(error);
      const handleFailureSpy = jest
        .spyOn(worker as any, 'handleFailure')
        .mockResolvedValue(undefined);

      // When
      await worker['processItem'](feedId);

      // Then
      expect(handleFailureSpy).toHaveBeenCalledWith(feedId, error);
    });
  });

  describe('handleFailure (private)', () => {
    it('실패하면 재시도 없이 재요청 락을 해제해야 한다', async () => {
      // Given
      const error = new Error('일시적 오류');
      delMock.mockResolvedValue(undefined);

      // When
      await worker['handleFailure'](feedId, error);

      // Then
      expect(delMock).toHaveBeenCalledWith(
        `${redisConstant.FEED_AI_RETRY_LOCK}:${feedId}`,
      );
    });

    it('락 해제가 실패해도 예외를 던지지 않고 로깅해야 한다', async () => {
      // Given
      const errorSpy = jest.spyOn(logger, 'error').mockImplementation();
      delMock.mockRejectedValue(new Error('redis down'));

      // When & Then
      await expect(
        worker['handleFailure'](feedId, new Error('일시적 오류')),
      ).resolves.toBeUndefined();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('AI 재요청 락 해제 실패'),
      );
    });
  });
});
