import { FeedCrawler } from '@src/feed-crawler';

import { redisConstant } from '@common/constant';
import logger from '@common/logger';
import { RedisConnection } from '@common/redis-access';
import { FullFeedCrawlMessage } from '@common/types';

import { AbstractQueueWorker } from '@event_worker/abstract-queue-worker';

import { RssRepository } from '@repository/rss.repository';

import { DEPENDENCY_SYMBOLS } from '@app-types/dependency-symbols';

import { inject, injectable } from 'tsyringe';

@injectable()
export class FullFeedCrawlEventWorker extends AbstractQueueWorker<FullFeedCrawlMessage> {
  constructor(
    @inject(DEPENDENCY_SYMBOLS.RedisConnection)
    redisConnection: RedisConnection,
    @inject(DEPENDENCY_SYMBOLS.RssRepository)
    private readonly rssRepository: RssRepository,
    @inject(DEPENDENCY_SYMBOLS.FeedCrawler)
    private readonly feedCrawler: FeedCrawler,
  ) {
    super('[Full Feed Crawler]', redisConnection);
  }

  protected async processQueue(): Promise<void> {
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
      await this.handleFailure(crawlMessage, error);
    }
  }

  protected async handleFailure(
    crawlMessage: FullFeedCrawlMessage,
    error: Error,
  ): Promise<void> {
    const shouldRetry = this.isRetryableError(error);

    logger.error(
      `${this.nameTag} RSS ID ${crawlMessage.rssId} 처리 실패:
      - 에러: ${error.name} - ${error.message}
      - 재시도 가능: ${shouldRetry}
      - 현재 deathCount: ${crawlMessage.deathCount}`,
    );

    if (shouldRetry && crawlMessage.deathCount < 3) {
      crawlMessage.deathCount++;
      await this.redisConnection.rpush(redisConstant.FULL_FEED_CRAWL_QUEUE, [
        JSON.stringify(crawlMessage),
      ]);
      logger.warn(
        `${this.nameTag} RSS ID ${crawlMessage.rssId} 재시도 예약 (${crawlMessage.deathCount}/3)`,
      );
    } else {
      const reason = shouldRetry
        ? `Death Count 3회 초과`
        : `재시도 불가능한 에러 (${error.name})`;
      logger.error(
        `${this.nameTag} RSS ID ${crawlMessage.rssId} 영구 실패 - ${reason}`,
      );
    }
  }

  private isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();

    // 재시도하면 안 되는 케이스 (영구적 에러)
    if (message.includes('invalid') || message.includes('401')) return false;
    if (message.includes('json') || message.includes('parse')) return false;
    if (message.includes('찾을 수 없습니다')) return false; // RSS 없음

    // 재시도해야 하는 케이스 (일시적 에러)
    if (message.includes('rate limit') || message.includes('429')) return true;
    if (message.includes('timeout') || message.includes('503')) return true;
    if (message.includes('network') || message.includes('fetch')) return true;

    // 기본값: 재시도
    return true;
  }
}
