import 'reflect-metadata';

import { FullFeedCrawlMessage, RssObj } from '@common/feed/feed.type';
import { FeedMetrics } from '@common/metrics/feed-metrics';
import { RedisConnection } from '@common/redis/redis-access';
import { redisConstant } from '@common/redis/redis.constant';

import { FullFeedCrawlEventWorker } from '@event_worker/workers/full-feed-crawl-event-worker';

import { RssRepository } from '@repository/rss.repository';

import { FeedCrawler } from '../../src/feed-crawler';

describe('FullFeedCrawlEventWorker', () => {
  let worker: FullFeedCrawlEventWorker;
  let mockRedisConnection: jest.Mocked<RedisConnection>;
  let mockRssRepository: jest.Mocked<RssRepository>;
  let mockFeedCrawler: jest.Mocked<FeedCrawler>;
  let mockFeedMetrics: jest.Mocked<FeedMetrics>;
  let llenMock: jest.Mock;
  let rpopMock: jest.Mock;
  let selectRssByIdMock: jest.Mock;
  let startFullCrawlMock: jest.Mock;
  let queueDepthSetMock: jest.Mock;
  let permanentFailureIncMock: jest.Mock;

  const crawlMessage: FullFeedCrawlMessage = {
    rssId: 3,
    timestamp: Date.now(),
    deathCount: 0,
  };

  const rssObj: RssObj = {
    id: 3,
    blogName: '테스트 블로그',
    blogPlatform: 'tistory',
    rssUrl: 'https://test.tistory.com/rss',
    blogImage: null,
  };

  beforeEach(() => {
    llenMock = jest.fn().mockResolvedValue(0);
    rpopMock = jest.fn();
    selectRssByIdMock = jest.fn();
    startFullCrawlMock = jest.fn();

    mockRedisConnection = {
      llen: llenMock,
      rpop: rpopMock,
      rpush: jest.fn(),
    } as any;

    mockRssRepository = {
      selectRssById: selectRssByIdMock,
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
      mockRedisConnection,
      mockRssRepository,
      mockFeedCrawler,
      mockFeedMetrics,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processQueue', () => {
    it('큐 깊이를 메트릭에 기록해야 한다', async () => {
      // Given
      llenMock.mockResolvedValue(5);
      rpopMock.mockResolvedValue(null);

      // When
      await worker['processQueue']();

      // Then
      expect(queueDepthSetMock).toHaveBeenCalledWith(5);
    });

    it('큐가 비어있으면 처리하지 않아야 한다', async () => {
      // Given
      rpopMock.mockResolvedValue(null);
      const processItemSpy = jest.spyOn(worker as any, 'processItem');

      // When
      await worker['processQueue']();

      // Then
      expect(processItemSpy).not.toHaveBeenCalled();
    });

    it('메시지가 있으면 파싱하여 processItem을 호출해야 한다', async () => {
      // Given
      rpopMock.mockResolvedValue(JSON.stringify(crawlMessage));
      const processItemSpy = jest
        .spyOn(worker as any, 'processItem')
        .mockResolvedValue(undefined);

      // When
      await worker['processQueue']();

      // Then
      expect(rpopMock).toHaveBeenCalledWith(
        redisConstant.FULL_FEED_CRAWL_QUEUE,
      );
      expect(processItemSpy).toHaveBeenCalledWith(crawlMessage);
    });
  });

  describe('processItem', () => {
    it('RSS를 찾을 수 없으면 크롤링하지 않아야 한다', async () => {
      // Given
      selectRssByIdMock.mockResolvedValue(null);

      // When
      await worker['processItem'](crawlMessage);

      // Then
      expect(startFullCrawlMock).not.toHaveBeenCalled();
    });

    it('RSS를 찾으면 전체 크롤링을 수행해야 한다', async () => {
      // Given
      selectRssByIdMock.mockResolvedValue(rssObj);
      startFullCrawlMock.mockResolvedValue([]);

      // When
      await worker['processItem'](crawlMessage);

      // Then
      expect(selectRssByIdMock).toHaveBeenCalledWith(crawlMessage.rssId);
      expect(startFullCrawlMock).toHaveBeenCalledWith(rssObj);
    });

    it('크롤링 중 에러 발생 시 handleFailure를 호출해야 한다', async () => {
      // Given
      const error = new Error('크롤링 실패');
      selectRssByIdMock.mockResolvedValue(rssObj);
      startFullCrawlMock.mockRejectedValue(error);
      const handleFailureSpy = jest
        .spyOn(worker as any, 'handleFailure')
        .mockResolvedValue(undefined);

      // When
      await worker['processItem'](crawlMessage);

      // Then
      expect(handleFailureSpy).toHaveBeenCalledWith(crawlMessage, error);
    });
  });

  describe('onPermanentFailure', () => {
    it('영구 실패 메트릭을 증가시켜야 한다', async () => {
      // When
      await worker['onPermanentFailure']();

      // Then
      expect(permanentFailureIncMock).toHaveBeenCalled();
    });
  });

  describe('queue key accessors', () => {
    it('getQueueKey와 getRetryQueueKey는 전체 크롤링 큐를 반환해야 한다', () => {
      expect(worker['getQueueKey']()).toBe(redisConstant.FULL_FEED_CRAWL_QUEUE);
      expect(worker['getRetryQueueKey']()).toBe(
        redisConstant.FULL_FEED_CRAWL_QUEUE,
      );
    });

    it('getItemLabel은 rssId를 포함해야 한다', () => {
      expect(worker['getItemLabel'](crawlMessage)).toBe(
        `RSS ID ${crawlMessage.rssId}`,
      );
    });
  });
});
