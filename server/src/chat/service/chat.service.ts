import { Injectable } from '@nestjs/common';

import { getRandomNickname } from '@woowa-babble/random-nickname';

import {
  CHAT_HISTORY_LIMIT,
  CLIENT_KEY_PREFIX,
  MAX_CLIENTS,
} from '@chat/constant/constant';
import { RedisMessagePayload } from '@chat/constant/type';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

@Injectable()
export class ChatService {
  constructor(private readonly redisService: RedisService) {}

  isMaxClientExceeded(userCount: number) {
    return userCount > MAX_CLIENTS;
  }

  async getOrCreateUserName(
    userId: string | null,
  ): Promise<{ userId: string; userName: string; isNew: boolean }> {
    if (userId) {
      const redisKey = CLIENT_KEY_PREFIX + userId;
      const existing = await this.redisService.get(redisKey);
      if (existing) {
        return { userId, userName: existing, isNew: false };
      }
      const userName = this.generateRandomUsername();
      await this.redisService.set(redisKey, userName, 'EX', 3600 * 24);
      return { userId, userName, isNew: false };
    }

    const newUserId = crypto.randomUUID();
    const userName = this.generateRandomUsername();
    await this.redisService.set(
      CLIENT_KEY_PREFIX + newUserId,
      userName,
      'EX',
      3600 * 24,
    );
    return { userId: newUserId, userName, isNew: true };
  }

  private generateRandomUsername(): string {
    return getRandomNickname('animals');
  }

  async getChatHistory() {
    return (await this.getRecentChatMessages())
      .map((msg) => JSON.parse(msg) as RedisMessagePayload)
      .reverse();
  }

  private async getRecentChatMessages() {
    return await this.redisService.lrange(
      REDIS_KEYS.CHAT_HISTORY_KEY,
      0,
      CHAT_HISTORY_LIMIT - 1,
    );
  }

  async saveMessageToRedis(message: RedisMessagePayload) {
    await this.redisService.lpush(
      REDIS_KEYS.CHAT_HISTORY_KEY,
      JSON.stringify(message),
    );
    await this.redisService.ltrim(
      REDIS_KEYS.CHAT_HISTORY_KEY,
      0,
      CHAT_HISTORY_LIMIT - 1,
    );
  }
}
