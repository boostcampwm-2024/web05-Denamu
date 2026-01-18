import logger from '@common/logger';
import { RedisConnection } from '@common/redis-access';

export abstract class AbstractQueueWorker<T> {
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
      logger.error(`${this.nameTag} 처리 중 오류 발생: ${error.message}`);
    }

    const endTime = Date.now();
    const executionTime = endTime - startTime;
    logger.info(`${this.nameTag} 실행 시간: ${executionTime / 1000}seconds`);
    logger.info(`========== ${this.nameTag} 작업 완료 ==========`);
  }

  protected abstract processQueue(): Promise<void>;
  protected abstract getQueueKey(): string;
  protected abstract parseQueueMessage(message: string): T;
  protected abstract processItem(item: T): Promise<void>;

  protected abstract handleFailure(item: T, error: Error): Promise<void>;
}
