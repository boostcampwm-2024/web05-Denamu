import { injectable } from 'tsyringe';

import Redis, { ChainableCommander } from 'ioredis';
import Redis_Mock from 'ioredis-mock';

import { Lifecycle } from '@common/lifecycle/lifecycle.interface';
import logger from '@common/logger/logger';

@injectable()
export class RedisConnection implements Lifecycle {
  private redis: Redis;
  private nameTag: string;

  constructor() {
    this.nameTag = '[Redis]';
    this.connect();
  }

  connect() {
    if (process.env.NODE_ENV === 'TEST') {
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
      logger.error(
        `${this.nameTag} rpop 실행 중 오류 발생:
        메시지: ${error instanceof Error ? error.message : String(error)}
        스택 트레이스: ${error instanceof Error ? error.stack : ''}`,
      );
      throw error;
    }
  }

  async rpush(key: string, elements: (string | Buffer | number)[]) {
    try {
      await this.redis.rpush(key, ...elements);
    } catch (error) {
      logger.error(
        `${this.nameTag} rpush 실행 중 오류 발생:
        메시지: ${error instanceof Error ? error.message : String(error)}
        스택 트레이스: ${error instanceof Error ? error.stack : ''}`,
      );
    }
  }

  async stop() {
    logger.info('Redis 연결 종료 중...');
    if (this.redis) {
      try {
        await this.redis.quit();
      } catch (error) {
        logger.error(
          `${this.nameTag} connection quit 중 오류 발생:
          메시지: ${error instanceof Error ? error.message : String(error)}
          스택 트레이스: ${error instanceof Error ? error.stack : ''}`,
        );
      }
    }
  }

  async del(...keys: string[]): Promise<number> {
    return this.redis.del(...keys);
  }

  async executePipeline(commands: (pipeline: ChainableCommander) => void) {
    const pipeline = this.redis.pipeline();
    try {
      commands(pipeline);
      return pipeline.exec();
    } catch (error) {
      logger.error(
        `${this.nameTag} 파이프라인 실행 중 오류 발생:
        메시지: ${error instanceof Error ? error.message : String(error)}
        스택 트레이스: ${error instanceof Error ? error.stack : ''}`,
      );
      throw error;
    }
  }

  async smembers(key: string): Promise<string[]> {
    return this.redis.smembers(key);
  }

  async hset(key: string, ...fieldValues: (string | Buffer | number)[]) {
    await this.redis.hset(key, fieldValues);
  }

  async llen(key: string): Promise<number> {
    return this.redis.llen(key);
  }

  async flushall() {
    await this.redis.flushall();
  }
}
