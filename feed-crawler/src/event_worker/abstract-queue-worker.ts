import { RedisConnection } from '../common/redis-access';
import logger from '../common/logger';
import { InfoCodes, ErrorCodes } from '../common/log-codes';

export abstract class AbstractQueueWorker<T> {
  protected readonly nameTag: string;
  protected readonly redisConnection: RedisConnection;

  constructor(nameTag: string, redisConnection: RedisConnection) {
    this.nameTag = nameTag;
    this.redisConnection = redisConnection;
  }

  async start(): Promise<void> {
    logger.info(`${this.nameTag} 작업 시작`, {
      code: InfoCodes.FC_WORKER_START,
      context: 'Worker',
      workerId: this.nameTag,
    });
    const startTime = Date.now();

    try {
      await this.processQueue();
    } catch (error) {
      logger.error(`${this.nameTag} 처리 중 오류`, {
        code: ErrorCodes.FC_WORKER_PROCESS_ERROR,
        context: 'Worker',
        workerId: this.nameTag,
        stack: (error as Error).stack,
      });
    }

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    logger.info(`${this.nameTag} 작업 완료`, {
      code: InfoCodes.FC_WORKER_COMPLETE,
      context: 'Worker',
      workerId: this.nameTag,
      executionTimeMs: executionTime,
    });
  }

  protected abstract processQueue(): Promise<void>;
  protected abstract getQueueKey(): string;
  protected abstract parseQueueMessage(message: string): T;
  protected abstract processItem(item: T): Promise<void>;
  protected abstract handleFailure(item: T, error: Error): Promise<void>;
}
