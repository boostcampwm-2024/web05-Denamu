import { Injectable } from '@nestjs/common';

import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { getRandomNickname } from '@woowa-babble/random-nickname';
import { Counter, Gauge } from 'prom-client';
import { Server } from 'socket.io';

import {
  CLIENT_KEY_PREFIX,
  MAX_ANONYMOUS_ROOMS,
  MAX_ROOM_CLIENTS,
} from '@chat/constant/constant';
import { AssignRoomPayload } from '@chat/constant/type';

import { RedisService } from '@common/redis/redis.service';

@Injectable()
export class AnonymousRoomManager {
  private static readonly PREFIX = 'anonymous';

  constructor(
    private readonly redisService: RedisService,
    @InjectMetric('anonymous_chat_user_count')
    private readonly chatUserMetricCount: Gauge,
    @InjectMetric('anonymous_chat_message_count')
    private readonly chatMessageMetricCount: Counter,
  ) {}

  getRoomId(n: number): string {
    return `${AnonymousRoomManager.PREFIX}${n}`;
  }

  getRoomName(roomId: string): string {
    const n = roomId.replace(AnonymousRoomManager.PREFIX, '');
    return `익명 채팅방 ${n}`;
  }

  isAnonymousRoom(roomId: string): boolean {
    return roomId.startsWith(AnonymousRoomManager.PREFIX);
  }

  getAllRoomIds(): string[] {
    return Array.from({ length: MAX_ANONYMOUS_ROOMS }, (_, i) =>
      this.getRoomId(i + 1),
    );
  }

  getRoomClientCount(server: Server, roomId: string): number {
    return server.sockets.adapter.rooms.get(roomId)?.size ?? 0;
  }

  assignRoom(
    server: Server,
    requestedRoomId?: string,
  ): AssignRoomPayload | null {
    const roomIds = this.getAllRoomIds();

    if (
      requestedRoomId &&
      this.isAnonymousRoom(requestedRoomId) &&
      roomIds.includes(requestedRoomId)
    ) {
      const count = this.getRoomClientCount(server, requestedRoomId);
      if (count < MAX_ROOM_CLIENTS) {
        return {
          roomId: requestedRoomId,
          roomName: this.getRoomName(requestedRoomId),
        };
      }
    }

    for (const roomId of roomIds) {
      const count = this.getRoomClientCount(server, roomId);
      if (count < MAX_ROOM_CLIENTS) {
        return { roomId, roomName: this.getRoomName(roomId) };
      }
    }

    return null;
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

  trackUserConnected(roomId: string) {
    this.chatUserMetricCount.inc({ room: roomId });
  }

  trackUserDisconnected(roomId: string) {
    this.chatUserMetricCount.dec({ room: roomId });
  }

  trackMessageSent(roomId: string) {
    this.chatMessageMetricCount.inc({ room: roomId });
  }

  private generateRandomUsername(): string {
    return getRandomNickname('animals');
  }
}
