import { inject, injectable } from 'tsyringe';

import { Lifecycle } from '@common/lifecycle/lifecycle.interface';
import logger from '@common/logger/logger';
import { RedisConnection } from '@common/redis/redis-access';
import { redisConstant } from '@common/redis/redis.constant';

import { RMQ_QUEUES } from '@rabbitmq/rabbitmq.constant';
import { RabbitMQService } from '@rabbitmq/rabbitmq.service';

import { FeedCrawler } from '../../feed-crawler';

@injectable()
export class AiSummaryRetryEventWorker implements Lifecycle {
  private readonly nameTag = '[AI Summary Retry]';
  private consumerTag: string | null = null;

  constructor(
    @inject(RabbitMQService)
    private readonly rabbitmqService: RabbitMQService,
    @inject(RedisConnection)
    private readonly redisConnection: RedisConnection,
    @inject(FeedCrawler)
    private readonly feedCrawler: FeedCrawler,
  ) {}

  async start(): Promise<void> {
    logger.info(`${this.nameTag} 시작 중...`);

    this.consumerTag = await this.rabbitmqService.consumeMessage<number>(
      RMQ_QUEUES.CRAWLING_AI_RETRY,
      async (feedId) => {
        await this.processItem(feedId);
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

  private async processItem(feedId: number): Promise<void> {
    logger.info(
      `${this.nameTag} feedId ${feedId} AI 요약 재요청을 시작합니다.`,
    );

    try {
      await this.feedCrawler.requeueFeedForAiSummary(feedId);
    } catch (error) {
      await this.handleFailure(feedId, error as Error);
    }
  }

  private async handleFailure(feedId: number, error: Error): Promise<void> {
    logger.error(
      `${this.nameTag} feedId ${feedId} AI 요약 재요청 실패: ${error.message}`,
    );
    await this.releaseRetryLock(feedId);
  }

  private async releaseRetryLock(feedId: number): Promise<void> {
    try {
      await this.redisConnection.del(
        `${redisConstant.FEED_AI_RETRY_LOCK}:${feedId}`,
      );
    } catch (error) {
      logger.error(
        `${this.nameTag} feedId ${feedId} AI 재요청 락 해제 실패: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
