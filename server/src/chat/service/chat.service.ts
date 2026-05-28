import { Injectable } from '@nestjs/common';

import { CHAT_HISTORY_LIMIT } from '@chat/constant/constant';
import { RedisMessagePayload } from '@chat/constant/type';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

@Injectable()
export class ChatService {
  constructor(private readonly redisService: RedisService) {}

  async getChatHistory(roomId: string) {
    return (await this.getRecentChatMessages(roomId))
      .map((msg) => JSON.parse(msg) as RedisMessagePayload)
      .reverse();
  }

  private async getRecentChatMessages(roomId: string) {
    return await this.redisService.lrange(
      REDIS_KEYS.CHAT_HISTORY_KEY(roomId),
      0,
      CHAT_HISTORY_LIMIT - 1,
    );
  }

  async saveMessageToRedis(message: RedisMessagePayload) {
    const key = REDIS_KEYS.CHAT_HISTORY_KEY(message.room);
    await this.redisService.lpush(key, JSON.stringify(message));
    await this.redisService.ltrim(key, 0, CHAT_HISTORY_LIMIT - 1);
  }
}
