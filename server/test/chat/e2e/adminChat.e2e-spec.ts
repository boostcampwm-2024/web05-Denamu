import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';
import * as uuid from 'uuid';

import { AdminRepository } from '@admin/repository/admin.repository';

import {
  ADMIN_DELETED_MESSAGE,
  ADMIN_DELETED_USERNAME,
} from '@chat/constant/constant';
import { RedisMessagePayload } from '@chat/constant/type';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const ROOM = 'anonymous1';
const ROOMS_URL = '/api/admins/chats';
const MESSAGES_URL = (roomId: string) => `/api/admins/chats/${roomId}`;
const DELETE_URL = (roomId: string, messageId: string) =>
  `/api/admins/chats/${roomId}/${messageId}`;

describe('Admin Chat (/api/admins/chats) E2E Test', () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;

  const sessionKey = 'admin-chat-session-key';
  const redisAuthKey = (data: string) =>
    `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;

  const createPayload = (
    overwrites: Partial<RedisMessagePayload> = {},
  ): RedisMessagePayload => ({
    messageId: uuid.v4(),
    userId: uuid.v4(),
    userName: 'tester',
    message: 'hello',
    timestamp: new Date().toISOString(),
    room: ROOM,
    ...overwrites,
  });

  const seedMessage = async (payload: RedisMessagePayload) => {
    await redisService.zadd(
      REDIS_KEYS.CHAT_HISTORY_KEY(payload.room),
      new Date(payload.timestamp).getTime(),
      JSON.stringify(payload),
    );
  };

  beforeAll(async () => {
    await testApp.listen(0);
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    adminRepository = testApp.get(AdminRepository);
  });

  beforeEach(async () => {
    const admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    await redisService.set(redisAuthKey(sessionKey), admin.email);
  });

  describe('GET /api/admins/chats', () => {
    it('[401] 관리자 세션이 없으면 실패한다.', async () => {
      const response = await agent.get(ROOMS_URL);

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('[200] 모든 채팅방 목록과 메시지 수를 반환한다.', async () => {
      // given
      await seedMessage(createPayload());
      await seedMessage(createPayload());

      // when
      const response = await agent
        .get(ROOMS_URL)
        .set('Cookie', `sessionId=${sessionKey}`);

      // then
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data).toHaveLength(3);
      const room1 = response.body.data.find(
        (r: { roomId: string }) => r.roomId === ROOM,
      );
      expect(room1).toMatchObject({
        roomId: ROOM,
        roomName: '익명 채팅방 1',
        messageCount: 2,
        userCount: 0,
      });
    });
  });

  describe('GET /api/admins/chats/:roomId', () => {
    it('[401] 관리자 세션이 없으면 실패한다.', async () => {
      const response = await agent.get(MESSAGES_URL(ROOM));

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('[400] roomId 형식이 올바르지 않으면 실패한다.', async () => {
      const response = await agent
        .get(MESSAGES_URL('anonymous0'))
        .set('Cookie', `sessionId=${sessionKey}`);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('[200] 해당 채팅방의 메시지를 시간순으로 반환한다.', async () => {
      // given
      const older = createPayload({
        message: 'older',
        timestamp: '2025-01-01T00:00:00.000Z',
      });
      const newer = createPayload({
        message: 'newer',
        timestamp: '2025-01-01T00:00:01.000Z',
      });
      await seedMessage(newer);
      await seedMessage(older);

      // when
      const response = await agent
        .get(MESSAGES_URL(ROOM))
        .set('Cookie', `sessionId=${sessionKey}`);

      // then
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data.map((m: RedisMessagePayload) => m.message)).toStrictEqual([
        'older',
        'newer',
      ]);
    });

    it('[200] 메시지가 없으면 빈 배열을 반환한다.', async () => {
      const response = await agent
        .get(MESSAGES_URL(ROOM))
        .set('Cookie', `sessionId=${sessionKey}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data).toStrictEqual([]);
    });
  });

  describe('DELETE /api/admins/chats/:roomId/:messageId', () => {
    it('[401] 관리자 세션이 없으면 실패한다.', async () => {
      const payload = createPayload();
      await seedMessage(payload);

      const response = await agent.delete(
        DELETE_URL(ROOM, payload.messageId),
      );

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('[400] messageId가 UUIDv4가 아니면 실패한다.', async () => {
      const response = await agent
        .delete(DELETE_URL(ROOM, 'invalid-id'))
        .set('Cookie', `sessionId=${sessionKey}`);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('[404] 존재하지 않는 메시지면 실패한다.', async () => {
      const response = await agent
        .delete(DELETE_URL(ROOM, uuid.v4()))
        .set('Cookie', `sessionId=${sessionKey}`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('[200] 메시지를 tombstone으로 치환한다.', async () => {
      // given
      const payload = createPayload({ message: 'secret' });
      await seedMessage(payload);

      // when
      const response = await agent
        .delete(DELETE_URL(ROOM, payload.messageId))
        .set('Cookie', `sessionId=${sessionKey}`);

      // then
      expect(response.status).toBe(HttpStatus.OK);

      // Redis then - 같은 messageId가 tombstone으로 남는다
      const members = await redisService.zrange(
        REDIS_KEYS.CHAT_HISTORY_KEY(ROOM),
        0,
        -1,
      );
      expect(members).toHaveLength(1);
      const saved = JSON.parse(members[0]) as RedisMessagePayload;
      expect(saved.messageId).toBe(payload.messageId);
      expect(saved.deleted).toBe(true);
      expect(saved.message).toBe(ADMIN_DELETED_MESSAGE);
      expect(saved.userName).toBe(ADMIN_DELETED_USERNAME);
    });

    it('[404] 이미 삭제된 메시지는 다시 삭제할 수 없다.', async () => {
      // given
      const payload = createPayload({ deleted: true });
      await seedMessage(payload);

      // when
      const response = await agent
        .delete(DELETE_URL(ROOM, payload.messageId))
        .set('Cookie', `sessionId=${sessionKey}`);

      // then
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
