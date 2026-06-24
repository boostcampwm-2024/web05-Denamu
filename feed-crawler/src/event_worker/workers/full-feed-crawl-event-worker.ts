import { inject, injectable } from 'tsyringe';

import { redisConstant } from '@common/constant';
import logger from '@common/logger';
import { FeedMetrics } from '@common/metrics/feed-metrics';
import { RedisConnection } from '@common/redis-access';
import { FullFeedCrawlMessage } from '@common/types';

import { AbstractQueueWorker } from '@event_worker/abstract-queue-worker';

import { RssRepository } from '@repository/rss.repository';

import { FeedCrawler } from '../../feed-crawler';

@injectable()
export class FullFeedCrawlEventWorker extends AbstractQueueWorker<FullFeedCrawlMessage> {
  constructor(
    @inject(RedisConnection)
    redisConnection: RedisConnection,
    @inject(RssRepository)
    private readonly rssRepository: RssRepository,
    @inject(FeedCrawler)
    private readonly feedCrawler: FeedCrawler,
    @inject(FeedMetrics)
    private readonly feedMetrics: FeedMetrics,
  ) {
    super('[Full Feed Crawler]', redisConnection);
  }

  protected async processQueue(): Promise<void> {
    const depth = await this.redisConnection.llen(this.getQueueKey());
    this.feedMetrics.fullCrawlQueueDepth.set(depth);
    const rssIdMessage = await this.redisConnection.rpop(this.getQueueKey());

    if (!rssIdMessage) {
      logger.info('처리할 전체 피드 크롤링 요청이 없습니다.');
      return;
    }

    const crawlMessage = this.parseQueueMessage(rssIdMessage);
    await this.processItem(crawlMessage);
  }

  protected getQueueKey(): string {
    return redisConstant.FULL_FEED_CRAWL_QUEUE;
  }

  protected parseQueueMessage(message: string): FullFeedCrawlMessage {
    return JSON.parse(message);
  }

  protected async processItem(
    crawlMessage: FullFeedCrawlMessage,
  ): Promise<void> {
    const rssId = crawlMessage.rssId;

    logger.info(
      `${this.nameTag} RSS ID ${rssId}에 대한 전체 피드 크롤링을 시작합니다.`,
    );

    const rssObj = await this.rssRepository.selectRssById(rssId);
    if (!rssObj) {
      logger.warn(`${this.nameTag} RSS ID ${rssId}를 찾을 수 없습니다.`);
      return;
    }

    try {
      const insertedFeeds = await this.feedCrawler.startFullCrawl(rssObj);
      logger.info(
        `${this.nameTag} RSS ID ${rssId}에서 ${insertedFeeds.length}개의 피드를 처리했습니다.`,
      );
    } catch (error) {
      await this.handleFailure(crawlMessage, error as Error);
    }
  }

  protected getRetryQueueKey(): string {
    return redisConstant.FULL_FEED_CRAWL_QUEUE;
  }

  protected getItemLabel(crawlMessage: FullFeedCrawlMessage): string {
    return `RSS ID ${crawlMessage.rssId}`;
  }

  protected onPermanentFailure(): Promise<void> {
    this.feedMetrics.fullCrawlPermanentFailure.inc();
    return Promise.resolve();
  }
}
