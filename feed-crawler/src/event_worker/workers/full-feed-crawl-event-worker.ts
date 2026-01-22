import { inject, injectable } from 'tsyringe';
import { RedisConnection } from '../../common/redis-access';
import { RssRepository } from '../../repository/rss.repository';
import { FeedCrawler } from '../../feed-crawler';
import { DEPENDENCY_SYMBOLS } from '../../types/dependency-symbols';
import { redisConstant } from '../../common/constant';
import logger from '../../common/logger';
import { InfoCodes, ErrorCodes, WarnCodes } from '../../common/log-codes';
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
      logger.info('처리할 전체 피드 크롤링 요청 없음', {
        code: InfoCodes.FC_FULL_CRAWL_NO_REQUEST,
        context: 'FullCrawler',
      });
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

  protected async processItem(crawlMessage: FullFeedCrawlMessage): Promise<void> {
    const rssId = crawlMessage.rssId;

    logger.info(`전체 피드 크롤링 시작: rssId=${rssId}`, {
      code: InfoCodes.FC_FULL_CRAWL_START,
      context: 'FullCrawler',
      rssId,
    });

    const rssObj = await this.rssRepository.selectRssById(rssId);
    if (!rssObj) {
      logger.error(`RSS를 찾을 수 없음: rssId=${rssId}`, {
        code: ErrorCodes.FC_RSS_NOT_FOUND,
        context: 'FullCrawler',
        rssId,
      });
      return;
    }

    try {
      const insertedFeeds = await this.feedCrawler.startFullCrawl(rssObj);

      logger.info(`전체 피드 크롤링 완료: ${insertedFeeds.length}개 처리`, {
        code: InfoCodes.FC_FEED_FOUND,
        context: 'FullCrawler',
        rssId,
        blogName: rssObj.blogName,
        count: insertedFeeds.length,
      });
    } catch (error) {
      await this.handleFailure(crawlMessage, error as Error);
    }
  }

  protected async handleFailure(crawlMessage: FullFeedCrawlMessage, error: Error): Promise<void> {
    const shouldRetry = this.isRetryableError(error);

    logger.error(`피드 추가 실패: rssId=${crawlMessage.rssId}`, {
      code: ErrorCodes.FC_FEED_ADD_ERROR,
      context: 'FullCrawler',
      rssId: crawlMessage.rssId,
      deathCount: crawlMessage.deathCount,
      retryable: shouldRetry,
      stack: error.stack,
    });

    if (shouldRetry && crawlMessage.deathCount < 3) {
      crawlMessage.deathCount++;
      await this.redisConnection.rpush(redisConstant.FULL_FEED_CRAWL_QUEUE, [
        JSON.stringify(crawlMessage),
      ]);

      logger.warn(`피드 추가 재시도 예약: rssId=${crawlMessage.rssId}`, {
        code: WarnCodes.FC_FEED_ADD_RETRY,
        context: 'FullCrawler',
        rssId: crawlMessage.rssId,
        deathCount: crawlMessage.deathCount,
      });
    } else {
      logger.error(`피드 추가 영구 실패: rssId=${crawlMessage.rssId}`, {
        code: ErrorCodes.FC_FEED_ADD_FAILURE,
        context: 'FullCrawler',
        rssId: crawlMessage.rssId,
        deathCount: crawlMessage.deathCount,
        reason: shouldRetry ? 'Death Count 3회 초과' : `재시도 불가능한 에러 (${error.name})`,
      });
    }
  }

  private isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();

    if (message.includes('invalid') || message.includes('401')) return false;
    if (message.includes('json') || message.includes('parse')) return false;
    if (message.includes('찾을 수 없습니다')) return false;
    if (message.includes('rate limit') || message.includes('429')) return true;
    if (message.includes('timeout') || message.includes('503')) return true;
    if (message.includes('network') || message.includes('fetch')) return true;

    return true;
  }
}
