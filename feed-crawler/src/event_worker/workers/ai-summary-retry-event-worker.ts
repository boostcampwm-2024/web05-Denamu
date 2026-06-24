import { inject, injectable } from 'tsyringe';

import { AiSummaryRetryMessage } from '@common/ai/ai.type';
import logger from '@common/logger/logger';
import { RedisConnection } from '@common/redis/redis-access';
import { redisConstant } from '@common/redis/redis.constant';

import { AbstractQueueWorker } from '@event_worker/abstract-queue-worker';

import { FeedCrawler } from '../../feed-crawler';

@injectable()
export class AiSummaryRetryEventWorker extends AbstractQueueWorker<AiSummaryRetryMessage> {
  constructor(
    @inject(RedisConnection)
    redisConnection: RedisConnection,
    @inject(FeedCrawler)
    private readonly feedCrawler: FeedCrawler,
  ) {
    super('[AI Summary Retry]', redisConnection);
  }

  protected async processQueue(): Promise<void> {
    const message = await this.redisConnection.rpop(this.getQueueKey());

    if (!message) {
      logger.info('처리할 AI 요약 재요청이 없습니다.');
      return;
    }

    const retryMessage = this.parseQueueMessage(message);
    await this.processItem(retryMessage);
  }

  protected getQueueKey(): string {
    return redisConstant.FEED_AI_RETRY_QUEUE;
  }

  protected parseQueueMessage(message: string): AiSummaryRetryMessage {
    return JSON.parse(message);
  }

  protected async processItem(
    retryMessage: AiSummaryRetryMessage,
  ): Promise<void> {
    const feedId = retryMessage.feedId;

    logger.info(
      `${this.nameTag} feedId ${feedId} AI 요약 재요청을 시작합니다.`,
    );

    try {
      await this.feedCrawler.requeueFeedForAiSummary(feedId);
    } catch (error) {
      await this.handleFailure(retryMessage, error as Error);
    }
  }

  protected getRetryQueueKey(): string {
    return redisConstant.FEED_AI_RETRY_QUEUE;
  }

  protected getItemLabel(retryMessage: AiSummaryRetryMessage): string {
    return `feedId ${retryMessage.feedId}`;
  }

  protected async onPermanentFailure(
    retryMessage: AiSummaryRetryMessage,
  ): Promise<void> {
    await this.releaseRetryLock(retryMessage.feedId);
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
