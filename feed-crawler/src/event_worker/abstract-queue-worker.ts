import { isRetryable } from '@common/errors';
import logger from '@common/logger/logger';
import { RedisConnection } from '@common/redis/redis-access';

export const MAX_DEATH_COUNT = 3;

export abstract class AbstractQueueWorker<T extends { deathCount: number }> {
  protected readonly nameTag: string;
  protected readonly redisConnection: RedisConnection;

  constructor(nameTag: string, redisConnection: RedisConnection) {
    this.nameTag = nameTag;
    this.redisConnection = redisConnection;
  }

  async start(): Promise<void> {
    logger.info(`========== ${this.nameTag} 작업 시작 ==========`);
    const startTime = Date.now();

    try {
      await this.processQueue();
    } catch (error) {
      logger.error(
        `${this.nameTag} 처리 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    const endTime = Date.now();
    const executionTime = endTime - startTime;
    logger.info(`${this.nameTag} 실행 시간: ${executionTime / 1000}seconds`);
    logger.info(`========== ${this.nameTag} 작업 완료 ==========`);
  }

  protected async handleFailure(item: T, error: Error): Promise<void> {
    const retryable = isRetryable(error);

    logger.error(
      `${this.nameTag} ${this.getItemLabel(item)} 처리 실패:
      - 에러: ${error.name} - ${error.message}
      - 재시도 가능: ${retryable}
      - 현재 deathCount: ${item.deathCount}`,
    );

    if (retryable && item.deathCount < MAX_DEATH_COUNT) {
      item.deathCount++;
      try {
        await this.pushToRetryQueue(item);
        logger.warn(
          `${this.nameTag} ${this.getItemLabel(item)} 재시도 예약 (${item.deathCount}/${MAX_DEATH_COUNT})`,
        );
      } catch (pushError) {
        logger.error(
          `${this.nameTag} ${this.getItemLabel(item)} 재시도 큐 재투입 실패 (메시지 유실): ${pushError instanceof Error ? pushError.message : String(pushError)}`,
        );
      }
      return;
    }

    const reason = retryable
      ? `Death Count ${MAX_DEATH_COUNT}회 초과`
      : `재시도 불가능한 에러 (${error.name})`;
    logger.error(
      `${this.nameTag} ${this.getItemLabel(item)} 영구 실패 - ${reason}`,
    );
    await this.onPermanentFailure(item, error);
  }

  protected async pushToRetryQueue(item: T): Promise<void> {
    await this.redisConnection.rpush(this.getRetryQueueKey(), [
      JSON.stringify(item),
    ]);
  }

  protected abstract processQueue(): Promise<void>;
  protected abstract getQueueKey(): string;
  protected abstract parseQueueMessage(message: string): T;
  protected abstract processItem(item: T): Promise<void>;
  protected abstract getRetryQueueKey(): string;
  protected abstract getItemLabel(item: T): string;
  protected abstract onPermanentFailure(item: T, error: Error): Promise<void>;
}
