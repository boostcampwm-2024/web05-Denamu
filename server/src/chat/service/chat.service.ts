import { Injectable } from '@nestjs/common';

import {
  ADMIN_DELETED_MESSAGE,
  ADMIN_DELETED_USERNAME,
  CHAT_HISTORY_LIMIT,
} from '@chat/constant/constant';
import { RedisMessagePayload } from '@chat/constant/type';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

@Injectable()
export class ChatService {
  constructor(private readonly redisService: RedisService) {}

  async getChatHistory(roomId: string): Promise<RedisMessagePayload[]> {
    const members = await this.redisService.zrange(
      REDIS_KEYS.CHAT_HISTORY_KEY(roomId),
      0,
      -1,
    );
    return members.map((m) => JSON.parse(m) as RedisMessagePayload);
  }

  async getMessageCount(roomId: string): Promise<number> {
    return this.redisService.zcard(REDIS_KEYS.CHAT_HISTORY_KEY(roomId));
  }

  async saveMessageToRedis(message: RedisMessagePayload) {
    const key = REDIS_KEYS.CHAT_HISTORY_KEY(message.room);
    const score = new Date(message.timestamp).getTime();
    await this.redisService.zadd(key, score, JSON.stringify(message));
    await this.redisService.zremrangebyrank(key, 0, -(CHAT_HISTORY_LIMIT + 1));
  }

  async deleteMessageByAdmin(
    roomId: string,
    messageId: string,
  ): Promise<RedisMessagePayload | null> {
    const key = REDIS_KEYS.CHAT_HISTORY_KEY(roomId);
    const entries = await this.redisService.zrange(key, 0, -1, 'WITHSCORES');

    for (let i = 0; i < entries.length; i += 2) {
      const member = entries[i];
      const score = Number(entries[i + 1]);
      const obj = JSON.parse(member) as RedisMessagePayload;

      if (obj.messageId === messageId && !obj.deleted) {
        const tombstone: RedisMessagePayload = {
          ...obj,
          message: ADMIN_DELETED_MESSAGE,
          userName: ADMIN_DELETED_USERNAME,
          deleted: true,
        };
        await this.redisService.zrem(key, member);
        await this.redisService.zadd(key, score, JSON.stringify(tombstone));
        return tombstone;
      }
    }

    return null;
  }
}
