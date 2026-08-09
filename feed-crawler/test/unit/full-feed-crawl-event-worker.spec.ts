import 'reflect-metadata';

import { FeedMetrics } from '@common/metrics/feed-metrics';

import { FullFeedCrawlEventWorker } from '@event_worker/workers/full-feed-crawl-event-worker';

import { RMQ_QUEUES } from '@rabbitmq/rabbitmq.constant';
import { RabbitMQService } from '@rabbitmq/rabbitmq.service';

import { FeedCrawler } from '../../src/feed-crawler';

describe('FullFeedCrawlEventWorker', () => {
  let worker: FullFeedCrawlEventWorker;
  let mockRabbitMQService: jest.Mocked<RabbitMQService>;
  let mockFeedCrawler: jest.Mocked<FeedCrawler>;
  let mockFeedMetrics: jest.Mocked<FeedMetrics>;
  let consumeMessageMock: jest.Mock;
  let closeConsumerMock: jest.Mock;
  let checkQueueMock: jest.Mock;
  let startFullCrawlMock: jest.Mock;
  let queueDepthSetMock: jest.Mock;
  let permanentFailureIncMock: jest.Mock;

  const rssId = 3;

  beforeEach(() => {
    consumeMessageMock = jest.fn().mockResolvedValue('consumer-tag');
    closeConsumerMock = jest.fn();
    checkQueueMock = jest.fn().mockResolvedValue({ messageCount: 0 });
    startFullCrawlMock = jest.fn();

    mockRabbitMQService = {
      consumeMessage: consumeMessageMock,
      closeConsumer: closeConsumerMock,
      checkQueue: checkQueueMock,
    } as any;

    mockFeedCrawler = {
      startFullCrawl: startFullCrawlMock,
    } as any;

    queueDepthSetMock = jest.fn();
    permanentFailureIncMock = jest.fn();
    mockFeedMetrics = {
      fullCrawlQueueDepth: { set: queueDepthSetMock },
      fullCrawlPermanentFailure: { inc: permanentFailureIncMock },
    } as any;

    worker = new FullFeedCrawlEventWorker(
      mockRabbitMQService,
      mockFeedCrawler,
      mockFeedMetrics,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('start', () => {
    it('crawling.full.queue를 리스닝해야 한다', async () => {
      // When
      await worker.start();

      // Then
      expect(consumeMessageMock).toHaveBeenCalledWith(
        RMQ_QUEUES.CRAWLING_FULL,
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

    it('시작하지 않았으면 consumer 취소를 호출하지 않아야 한다', async () => {
      // When
      await worker.stop();

      // Then
      expect(closeConsumerMock).not.toHaveBeenCalled();
    });
  });

  describe('processItem (private)', () => {
    it('feedCrawler.startFullCrawl을 호출해야 한다', async () => {
      // Given
      startFullCrawlMock.mockResolvedValue([]);

      // When
      await worker['processItem'](rssId);

      // Then
      expect(startFullCrawlMock).toHaveBeenCalledWith(rssId);
    });

    it('크롤링 중 에러 발생 시 handleFailure를 호출해야 한다', async () => {
      // Given
      const error = new Error('크롤링 실패');
      startFullCrawlMock.mockRejectedValue(error);
      const handleFailureSpy = jest
        .spyOn(worker as any, 'handleFailure')
        .mockReturnValue(undefined);

      // When
      await worker['processItem'](rssId);

      // Then
      expect(handleFailureSpy).toHaveBeenCalledWith(rssId, error);
    });
  });

  describe('handleFailure (private)', () => {
    it('실패 시 재시도 없이 영구 실패로 처리해야 한다', () => {
      // Given
      const error = new Error('크롤링 실패');

      // When
      worker['handleFailure'](rssId, error);

      // Then
      expect(permanentFailureIncMock).toHaveBeenCalled();
    });
  });
});
