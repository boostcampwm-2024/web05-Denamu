import Redis, { ChainableCommander } from 'ioredis';
import Redis_Mock from 'ioredis-mock';
import logger from './logger';
import { ErrorCodes } from './log-codes';
import { injectable } from 'tsyringe';

@injectable()
export class RedisConnection {
  private redis: Redis;

  constructor() {
    this.connect();
  }

  connect() {
    if (process.env.NODE_ENV === 'test') {
      this.redis = new Redis_Mock();
    } else {
      this.redis = new Redis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        username: process.env.REDIS_USER,
        password: process.env.REDIS_PASSWORD,
      });
    }
  }

  async rpop(key: string) {
    try {
      return await this.redis.rpop(key);
    } catch (error) {
      logger.error('Redis rpop 오류', {
        code: ErrorCodes.FC_REDIS_OPERATION_ERROR,
        context: 'Redis',
        operation: 'rpop',
        key,
        stack: (error as Error).stack,
      });
      throw error;
    }
  }

  async rpush(key: string, elements: (string | Buffer | number)[]) {
    try {
      await this.redis.rpush(key, ...elements);
    } catch (error) {
      logger.error('Redis rpush 오류', {
        code: ErrorCodes.FC_REDIS_OPERATION_ERROR,
        context: 'Redis',
        operation: 'rpush',
        key,
        stack: (error as Error).stack,
      });
    }
  }

  async quit() {
    if (this.redis) {
      try {
        await this.redis.quit();
      } catch (error) {
        logger.error('Redis 종료 오류', {
          code: ErrorCodes.FC_REDIS_CLOSE_ERROR,
          context: 'Redis',
          stack: (error as Error).stack,
        });
      }
    }
  }

  async del(...keys: string[]): Promise<number> {
    return this.redis.del(...keys);
  }

  async scan(
    cursor: string | number,
    match?: string,
    count?: number,
  ): Promise<[cursor: string, keys: string[]]> {
    const result = await this.redis.scan(cursor, 'MATCH', match || '*', 'COUNT', count || 10);
    return [result[0], result[1]];
  }

  async executePipeline(commands: (pipeline: ChainableCommander) => void) {
    const pipeline = this.redis.pipeline();
    try {
      commands(pipeline);
      return pipeline.exec();
    } catch (error) {
      logger.error('Redis 파이프라인 오류', {
        code: ErrorCodes.FC_REDIS_PIPELINE_ERROR,
        context: 'Redis',
        stack: (error as Error).stack,
      });
      throw error;
    }
  }

  async hset(key: string, ...fieldValues: (string | Buffer | number)[]) {
    await this.redis.hset(key, fieldValues);
  }

  async flushall() {
    await this.redis.flushall();
  }
}
