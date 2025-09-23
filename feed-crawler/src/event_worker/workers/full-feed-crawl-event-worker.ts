import { inject, injectable } from 'tsyringe';
import { RedisConnection } from '../../common/redis-access';
import { RssRepository } from '../../repository/rss.repository';
import { FeedCrawler } from '../../feed-crawler';
import { DEPENDENCY_SYMBOLS } from '../../types/dependency-symbols';
import { redisConstant } from '../../common/constant';
import logger from '../../common/logger';
import { AbstractQueueWorker } from '../abstract-queue-worker';
import { FullFeedCrawlMessage } from '../../common/types';

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
      logger.error(
        `${this.nameTag} RSS ID ${rssId} 처리 중 오류 발생: ${error.message}`,
      );
      await this.handleFailure(crawlMessage, error);
    }
  }

  protected async handleFailure(
    crawlMessage: FullFeedCrawlMessage,
    error: Error,
  ): Promise<void> {
    if (crawlMessage.deathCount < 3) {
      crawlMessage.deathCount++;
      await this.redisConnection.rpush(redisConstant.FULL_FEED_CRAWL_QUEUE, [
        JSON.stringify(crawlMessage),
      ]);
      logger.error(
        `${this.nameTag} ${crawlMessage.rssId} 의 Death Count 3회 이상 발생. 크롤링 스킵 처리`,
      );
    } else {
      logger.error(
        `${this.nameTag} RSS ID ${crawlMessage.rssId} 전체 피드 크롤링 실패: ${error.message}`,
      );
    }
  }
}
