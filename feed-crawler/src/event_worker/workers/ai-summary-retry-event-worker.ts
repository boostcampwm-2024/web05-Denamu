import { inject, injectable } from 'tsyringe';

import { redisConstant } from '@common/constant';
import logger from '@common/logger';
import { RedisConnection } from '@common/redis-access';
import { AiSummaryRetryMessage } from '@common/types';

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

  protected async handleFailure(
    retryMessage: AiSummaryRetryMessage,
    error: Error,
  ): Promise<void> {
    const shouldRetry = this.isRetryableError(error);

    logger.error(
      `${this.nameTag} feedId ${retryMessage.feedId} 처리 실패:
      - 에러: ${error.name} - ${error.message}
      - 재시도 가능: ${shouldRetry}
      - 현재 deathCount: ${retryMessage.deathCount}`,
    );

    if (shouldRetry && retryMessage.deathCount < 3) {
      retryMessage.deathCount++;
      await this.redisConnection.rpush(redisConstant.FEED_AI_RETRY_QUEUE, [
        JSON.stringify(retryMessage),
      ]);
      logger.warn(
        `${this.nameTag} feedId ${retryMessage.feedId} 재시도 예약 (${retryMessage.deathCount}/3)`,
      );
    } else {
      const reason = shouldRetry
        ? `Death Count 3회 초과`
        : `재시도 불가능한 에러 (${error.name})`;
      logger.error(
        `${this.nameTag} feedId ${retryMessage.feedId} 영구 실패 - ${reason}`,
      );
      await this.releaseRetryLock(retryMessage.feedId);
    }
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

  private isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();

    // 재시도하면 안 되는 케이스 (영구적 에러)
    if (message.includes('찾을 수 없습니다')) return false; // 피드/RSS 없음, 노출 범위 이탈
    if (message.includes('invalid') || message.includes('401')) return false;
    if (message.includes('json') || message.includes('parse')) return false;

    // 재시도해야 하는 케이스 (일시적 에러)
    if (message.includes('rate limit') || message.includes('429')) return true;
    if (message.includes('timeout') || message.includes('503')) return true;
    if (message.includes('network') || message.includes('fetch')) return true;

    // 기본값: 재시도
    return true;
  }
}
