import { Injectable } from '@nestjs/common';

import { getRandomNickname } from '@woowa-babble/random-nickname';
import { Socket } from 'socket.io';

import {
  BroadcastPayload,
  CHAT_HISTORY_LIMIT,
  CHAT_MIDNIGHT_CLIENT_NAME,
  CLIENT_KEY_PREFIX,
  MAX_CLIENTS,
} from '@chat/constant/chat.constant';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';
import { TIMEZONE_OFFSET_MS } from '@common/util/time.constant';

@Injectable()
export class ChatService {
  constructor(private readonly redisService: RedisService) {}

  isMaxClientExceeded(userCount: number) {
    return userCount > MAX_CLIENTS;
  }

  private getClientIp(client: Socket) {
    const forwardedFor = client.handshake.headers['x-forwarded-for'] as string;
    const ip = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : client.handshake.address;

    return ip;
  }

  async getClientNameByIp(client: Socket) {
    const ip = this.getClientIp(client);
    const redisKey = CLIENT_KEY_PREFIX + ip;
    const clientName: string = await this.getClientName(redisKey);
    if (clientName) {
      return clientName;
    }
    const createdClientName = await this.setClientName(redisKey);
    return createdClientName;
  }

  private async getClientName(redisKey: string) {
    return await this.redisService.get(redisKey);
  }

  private async setClientName(redisKey: string) {
    const clientName = this.generateRandomUsername();
    await this.redisService.set(redisKey, clientName, 'EX', 3600 * 24);
    return clientName;
  }

  private generateRandomUsername(): string {
    const type = 'animals';
    return getRandomNickname(type);
  }

  async getChatHistory() {
    return (await this.getRecentChatMessages())
      .map((msg) => JSON.parse(msg))
      .reverse();
  }

  private async getRecentChatMessages() {
    return await this.redisService.lrange(
      REDIS_KEYS.CHAT_HISTORY_KEY,
      0,
      CHAT_HISTORY_LIMIT - 1,
    );
  }

  async saveMessageToRedis(payload: BroadcastPayload) {
    await this.redisService.lpush(
      REDIS_KEYS.CHAT_HISTORY_KEY,
      JSON.stringify(payload),
    );
    await this.redisService.ltrim(
      REDIS_KEYS.CHAT_HISTORY_KEY,
      0,
      CHAT_HISTORY_LIMIT - 1,
    );
  }

  async setDateMessageReady() {
    const [second] = await this.redisService.time();
    const time = second * 1000;
    const ttlSeconds = this.getTTLNextMidnight(time);
    const kstDate = this.formatKstDateString(time);

    await this.redisService.set(
      `${REDIS_KEYS.CHAT_SYSTEM_MIDNIGHT_PREFIX}:ready:${kstDate}`,
      1,
      'NX',
      'EX',
      ttlSeconds,
    );
  }

  async publishDateMessageOnce() {
    const [second] = await this.redisService.time();
    const time = second * 1000;
    const ttlSeconds = this.getTTLNextMidnight(time);
    const kstDate = this.formatKstDateString(time);

    const readyKey = `${REDIS_KEYS.CHAT_SYSTEM_MIDNIGHT_PREFIX}:ready:${kstDate}`;
    const publishedKey = `${REDIS_KEYS.CHAT_SYSTEM_MIDNIGHT_PREFIX}:published:${kstDate}`;

    const broadcastPayload: BroadcastPayload = {
      userId: CHAT_MIDNIGHT_CLIENT_NAME,
      messageId: CHAT_MIDNIGHT_CLIENT_NAME,
      username: CHAT_MIDNIGHT_CLIENT_NAME,
      message: '',
      timestamp: new Date(time + TIMEZONE_OFFSET_MS.KST),
    };

    const script = `
      local readyKey = KEYS[1]
      local publishedKey = KEYS[2]
      local chatHistoryKey = KEYS[3]

      local ttl = tonumber(ARGV[1])
      local payload = ARGV[2]
      local historyLimit = tonumber(ARGV[3])

      if redis.call("EXISTS", publishedKey) == 1 then
        return nil
      end

      if redis.call("EXISTS", readyKey) == 0 then
        return nil
      end

      redis.call("LPUSH", chatHistoryKey, payload)
      redis.call("LTRIM", chatHistoryKey, 0, historyLimit - 1)
      redis.call("SET", publishedKey, "1", "EX", ttl)

      return payload
    `;

    const result = await this.redisService.eval(
      script,
      [readyKey, publishedKey, REDIS_KEYS.CHAT_HISTORY_KEY],
      [
        String(ttlSeconds),
        JSON.stringify(broadcastPayload),
        String(CHAT_HISTORY_LIMIT),
      ],
    );

    return result ? JSON.parse(result) : null;
  }

  private formatKstDateString(
    now: number,
    timezoneOffsetMs = TIMEZONE_OFFSET_MS.KST,
  ): string {
    const kstDate = new Date(now + timezoneOffsetMs);

    const year = kstDate.getUTCFullYear();
    const month = String(kstDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(kstDate.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private getTTLNextMidnight(
    now: number,
    millis = TIMEZONE_OFFSET_MS.KST,
  ): number {
    const kstNow = new Date(now + millis);

    const nextMidnightByKSTMs = Date.UTC(
      kstNow.getUTCFullYear(),
      kstNow.getUTCMonth(),
      kstNow.getUTCDate() + 1,
      0,
      0,
      0,
      0,
    );

    const nextMidnightUTC = nextMidnightByKSTMs - millis;

    const diffMs = nextMidnightUTC - now;
    const ttl = Math.floor(diffMs / 1000);

    return Math.max(ttl, 1);
  }
}
