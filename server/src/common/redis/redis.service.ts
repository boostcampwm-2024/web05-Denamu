import { Inject, Injectable } from '@nestjs/common';
import Redis, { ChainableCommander } from 'ioredis';
import { RedisKey } from 'ioredis/built/utils/RedisCommander';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') public readonly redisClient: Redis) {}

  async disconnect(): Promise<void> {
    await this.redisClient.disconnect();
  }

  async get(key: RedisKey): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async set(
    key: string,
    value: string | number,
    ...args: any[]
  ): Promise<'OK' | null> {
    return this.redisClient.set(key, value, ...args);
  }

  async del(...keys: string[]): Promise<number> {
    return this.redisClient.del(...keys);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.redisClient.keys(pattern);
  }

  async scan(
    cursor: string | number,
    match?: string,
    count?: number,
  ): Promise<[cursor: string, keys: string[]]> {
    const result = await this.redisClient.scan(
      cursor,
      'MATCH',
      match || '*',
      'COUNT',
      count || 10,
    );
    return [result[0], result[1]];
  }

  async mget(...keys: string[]): Promise<(string | null)[]> {
    return this.redisClient.mget(...keys);
  }

  async lrange(
    key: string,
    start: number | string,
    stop: number | string,
  ): Promise<string[]> {
    return this.redisClient.lrange(key, start, stop);
  }

  async lpush(key: string, ...values: (string | number)[]): Promise<number> {
    return this.redisClient.lpush(key, ...values);
  }

  async rpush(key: string, ...values: (string | number)[]): Promise<number> {
    return this.redisClient.rpush(key, ...values);
  }

  async zrevrange(
    key: string,
    start: number,
    stop: number,
    withScores?: 'WITHSCORES',
  ): Promise<string[]> {
    if (withScores) {
      return this.redisClient.zrevrange(key, start, stop, 'WITHSCORES');
    }
    return this.redisClient.zrevrange(key, start, stop);
  }

  async executePipeline(commands: (pipeline: ChainableCommander) => void) {
    const pipeline = this.redisClient.pipeline();
    commands(pipeline);
    const results = await pipeline.exec();

    return results;
  }

  async ltrim(
    key: string,
    start: number | string,
    stop: number | string,
  ): Promise<string> {
    return this.redisClient.ltrim(key, start, stop);
  }

  async sadd(key: string, ...members: string[] | number[]): Promise<number> {
    return this.redisClient.sadd(key, ...members);
  }

  async zadd(
    key: string,
    ...scoreMembers: (string | Buffer | number)[]
  ): Promise<number> {
    return this.redisClient.zadd(key, ...scoreMembers);
  }

  async zscore(key: string, member: string): Promise<string | null> {
    return this.redisClient.zscore(key, member);
  }

  async zrem(key: string, ...members: string[]): Promise<number> {
    return this.redisClient.zrem(key, ...members);
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    return this.redisClient.srem(key, ...members);
  }

  async flushdb(): Promise<string> {
    return this.redisClient.flushdb();
  }

  async flushall(): Promise<void> {
    this.redisClient.flushall();
  }

  async sismember(key: string, member: string | number): Promise<number> {
    return this.redisClient.sismember(key, member);
  }

  async zincrby(
    key: string,
    increment: number | string,
    member: string | number,
  ): Promise<string> {
    return this.redisClient.zincrby(key, increment, member);
  }
}
