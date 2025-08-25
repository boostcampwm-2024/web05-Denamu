import { inject, injectable } from 'tsyringe';
import { FeedRepository } from './repository/feed.repository';
import { FeedParserManager } from './common/parser/feed-parser-manager';
import { DEPENDENCY_SYMBOLS } from './types/dependency-symbols';
import { RedisConnection } from './common/redis-access';
import { redisConstant } from './common/constant';
import logger from './common/logger';
import { RssObj, FeedDetail } from './common/types';

interface CrawlMessage {
  rssId: number;
  rssUrl: string;
  blogName: string;
  blogPlatform: string;
  isNewRss: boolean;
  timestamp: number;
}

@injectable()
export class QueueCrawlerService {
  private isProcessing = false;
  private readonly batchSize: number;

  constructor(
    @inject(DEPENDENCY_SYMBOLS.FeedRepository)
    private readonly feedRepository: FeedRepository,
    @inject(DEPENDENCY_SYMBOLS.FeedParserManager)
    private readonly feedParserManager: FeedParserManager,
    @inject(DEPENDENCY_SYMBOLS.RedisConnection)
    private readonly redisConnection: RedisConnection,
  ) {
    this.batchSize = parseInt(process.env.CRAWL_BATCH_SIZE || '5');
  }

  async processQueue() {
    if (this.isProcessing) {
      logger.info('이미 큐 처리가 진행 중입니다.');
      return;
    }

    this.isProcessing = true;
    logger.info('큐 크롤링 작업을 시작합니다.');

    try {
      const queueLength = await this.redisConnection.llen(
        redisConstant.FEED_CRAWL_QUEUE,
      );
      if (queueLength === 0) {
        logger.info('처리할 큐 메시지가 없습니다.');
        return;
      }

      logger.info(`총 ${queueLength}개의 큐 메시지가 있습니다.`);

      const messagesToProcess = Math.min(this.batchSize, queueLength);
      const messages: CrawlMessage[] = [];

      for (let i = 0; i < messagesToProcess; i++) {
        const messageData = await this.redisConnection.brpop(
          redisConstant.FEED_CRAWL_QUEUE,
          1,
        );
        if (messageData) {
          try {
            const message = JSON.parse(messageData[1]) as CrawlMessage;
            messages.push(message);
          } catch (error) {
            logger.error(`메시지 파싱 오류: ${error.message}`);
          }
        }
      }

      if (messages.length === 0) {
        logger.info('유효한 메시지가 없습니다.');
        return;
      }

      logger.info(`${messages.length}개의 메시지를 처리합니다.`);
      await this.processCrawlMessages(messages);
    } catch (error) {
      logger.error(`큐 처리 중 오류 발생: ${error.message}`);
    } finally {
      this.isProcessing = false;
      logger.info('큐 크롤링 작업을 완료했습니다.');
    }
  }

  private async processCrawlMessages(messages: CrawlMessage[]) {
    const newFeedsByRss = await Promise.all(
      messages.map(async (message) => {
        logger.info(`${message.blogName}(${message.rssUrl}) 크롤링 시작`);

        const rssObj: RssObj = {
          id: message.rssId,
          rssUrl: message.rssUrl,
          blogName: message.blogName,
          blogPlatform: message.blogPlatform,
        };

        return await this.feedParserManager.fetchAndParse(rssObj);
      }),
    );

    const newFeeds = newFeedsByRss.flat();

    if (newFeeds.length === 0) {
      logger.info('새로운 피드가 없습니다.');
      return;
    }

    logger.info(`총 ${newFeeds.length}개의 새로운 피드를 발견했습니다.`);

    const insertedData: FeedDetail[] = await this.feedRepository.insertFeeds(
      newFeeds,
    );
    await this.feedRepository.saveAiQueue(insertedData);
    await this.feedRepository.setRecentFeedList(insertedData);
  }
}
