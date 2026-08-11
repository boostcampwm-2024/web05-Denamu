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

  private async execute<T>(
    operation: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      logger.error(
        `${this.nameTag} ${operation} 실행 중 오류 발생:
        메시지: ${error instanceof Error ? error.message : String(error)}
        스택 트레이스: ${error instanceof Error ? error.stack : ''}`,
      );
      throw error;
    }
  }

  async rpop(key: string) {
    return this.execute('rpop', () => this.redis.rpop(key));
  }

  async rpush(key: string, elements: (string | Buffer | number)[]) {
    await this.execute('rpush', () => this.redis.rpush(key, ...elements));
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
    return this.execute('del', () => this.redis.del(...keys));
  }

  async executePipeline(commands: (pipeline: ChainableCommander) => void) {
    return this.execute('pipeline', () => {
      const pipeline = this.redis.pipeline();
      commands(pipeline);
      return pipeline.exec();
    });
  }

  async smembers(key: string): Promise<string[]> {
    return this.execute('smembers', () => this.redis.smembers(key));
  }

  async hset(key: string, ...fieldValues: (string | Buffer | number)[]) {
    await this.execute('hset', () => this.redis.hset(key, ...fieldValues));
  }

  async llen(key: string): Promise<number> {
    return this.execute('llen', () => this.redis.llen(key));
  }

  async flushall() {
    await this.execute('flushall', () => this.redis.flushall());
  }
}
