import { inject, injectable } from 'tsyringe';

import { Lifecycle } from '@common/lifecycle/lifecycle.interface';
import logger from '@common/logger/logger';
import { FeedMetrics } from '@common/metrics/feed-metrics';

import { RMQ_QUEUES } from '@rabbitmq/rabbitmq.constant';
import { RabbitMQService } from '@rabbitmq/rabbitmq.service';

import { FeedCrawler } from '../../feed-crawler';

@injectable()
export class FullFeedCrawlEventWorker implements Lifecycle {
  private readonly nameTag = '[Full Feed Crawler]';
  private consumerTag: string | null = null;

  constructor(
    @inject(RabbitMQService)
    private readonly rabbitmqService: RabbitMQService,
    @inject(FeedCrawler)
    private readonly feedCrawler: FeedCrawler,
    @inject(FeedMetrics)
    private readonly feedMetrics: FeedMetrics,
  ) {}

  async start(): Promise<void> {
    logger.info(`${this.nameTag} 시작 중...`);

    this.consumerTag = await this.rabbitmqService.consumeMessage<number>(
      RMQ_QUEUES.CRAWLING_FULL,
      async (rssId) => {
        const { messageCount } = await this.rabbitmqService.checkQueue(
          RMQ_QUEUES.CRAWLING_FULL,
        );
        this.feedMetrics.fullCrawlQueueDepth.set(messageCount);
        await this.processItem(rssId);
      },
    );

    logger.info(`${this.nameTag} 큐 리스닝 시작`);
  }

  async stop(): Promise<void> {
    if (this.consumerTag) {
      await this.rabbitmqService.closeConsumer(this.consumerTag);
      logger.info(`${this.nameTag} 종료`);
    }
  }

  private async processItem(rssId: number): Promise<void> {
    logger.info(
      `${this.nameTag} RSS ID ${rssId}에 대한 전체 피드 크롤링을 시작합니다.`,
    );

    try {
      const insertedFeeds = await this.feedCrawler.startFullCrawl(rssId);
      logger.info(
        `${this.nameTag} RSS ID ${rssId}에서 ${insertedFeeds.length}개의 피드를 처리했습니다.`,
      );
    } catch (error) {
      this.handleFailure(rssId, error as Error);
    }
  }

  private handleFailure(rssId: number, error: Error): void {
    logger.error(
      `${this.nameTag} RSS ID ${rssId} 전체 피드 크롤링 실패: ${error.message}`,
    );
    this.feedMetrics.fullCrawlPermanentFailure.inc();
  }
}
