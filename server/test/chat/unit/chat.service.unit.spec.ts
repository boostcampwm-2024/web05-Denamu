import {
  ADMIN_DELETED_MESSAGE,
  ADMIN_DELETED_USERNAME,
  CHAT_HISTORY_LIMIT,
} from '@chat/constant/constant';
import { RedisMessagePayload } from '@chat/constant/type';
import { ChatService } from '@chat/service/chat.service';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

describe(`${ChatService.name} Unit Test`, () => {
  let chatService: ChatService;
  let redisService: jest.Mocked<
    Pick<
      RedisService,
      'zrange' | 'zadd' | 'zrem' | 'zcard' | 'zremrangebyrank'
    >
  >;

  const ROOM = 'room-1';
  const KEY = REDIS_KEYS.CHAT_HISTORY_KEY(ROOM);

  const createMessage = (
    overwrites: Partial<RedisMessagePayload> = {},
  ): RedisMessagePayload => ({
    messageId: 'message-1',
    userId: 'user-1',
    userName: 'tester',
    message: 'hello',
    timestamp: '2025-01-01T00:00:00.000Z',
    room: ROOM,
    ...overwrites,
  });

  beforeEach(() => {
    redisService = {
      zrange: jest.fn(),
      zadd: jest.fn(),
      zrem: jest.fn(),
      zcard: jest.fn(),
      zremrangebyrank: jest.fn(),
    };
    chatService = new ChatService(redisService as unknown as RedisService);
  });

  describe('getChatHistory', () => {
    it('ZSET을 시간순(오름차순)으로 파싱하여 반환한다.', async () => {
      // given
      const messages = [
        createMessage({ message: 'oldest' }),
        createMessage({ message: 'newest' }),
      ];
      redisService.zrange.mockResolvedValue(
        messages.map((m) => JSON.stringify(m)),
      );

      // when
      const result = await chatService.getChatHistory(ROOM);

      // then
      expect(redisService.zrange).toHaveBeenCalledWith(KEY, 0, -1);
      expect(result.map((m) => m.message)).toStrictEqual(['oldest', 'newest']);
    });

    it('저장된 메시지가 없으면 빈 배열을 반환한다.', async () => {
      // given
      redisService.zrange.mockResolvedValue([]);

      // when
      const result = await chatService.getChatHistory(ROOM);

      // then
      expect(result).toStrictEqual([]);
    });
  });

  describe('saveMessageToRedis', () => {
    it('timestamp를 score로 zadd하고 최신 N개만 남기도록 trim한다.', async () => {
      // given
      const message = createMessage();
      const score = new Date(message.timestamp).getTime();

      // when
      await chatService.saveMessageToRedis(message);

      // then
      expect(redisService.zadd).toHaveBeenCalledWith(
        KEY,
        score,
        JSON.stringify(message),
      );
      expect(redisService.zremrangebyrank).toHaveBeenCalledWith(
        KEY,
        0,
        -(CHAT_HISTORY_LIMIT + 1),
      );
    });
  });

  describe('deleteMessageByAdmin', () => {
    it('대상 member를 ZREM 후 같은 score로 tombstone을 ZADD하고 반환한다.', async () => {
      // given
      const target = createMessage({ messageId: 'message-2', message: 'bye' });
      const other = createMessage({ messageId: 'message-1' });
      const targetScore = new Date(target.timestamp).getTime();
      redisService.zrange.mockResolvedValue([
        JSON.stringify(other),
        String(new Date(other.timestamp).getTime()),
        JSON.stringify(target),
        String(targetScore),
      ]);

      // when
      const result = await chatService.deleteMessageByAdmin(ROOM, 'message-2');

      // then
      const tombstone = {
        ...target,
        message: ADMIN_DELETED_MESSAGE,
        userName: ADMIN_DELETED_USERNAME,
        deleted: true,
      };
      expect(redisService.zrem).toHaveBeenCalledWith(
        KEY,
        JSON.stringify(target),
      );
      expect(redisService.zadd).toHaveBeenCalledWith(
        KEY,
        targetScore,
        JSON.stringify(tombstone),
      );
      expect(result).toStrictEqual(tombstone);
    });

    it('이미 삭제된 메시지는 건너뛰고 null을 반환한다.', async () => {
      // given
      const deleted = createMessage({ deleted: true });
      redisService.zrange.mockResolvedValue([
        JSON.stringify(deleted),
        String(new Date(deleted.timestamp).getTime()),
      ]);

      // when
      const result = await chatService.deleteMessageByAdmin(ROOM, 'message-1');

      // then
      expect(redisService.zrem).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('대상 메시지가 없으면 null을 반환한다.', async () => {
      // given
      redisService.zrange.mockResolvedValue([]);

      // when
      const result = await chatService.deleteMessageByAdmin(ROOM, 'missing');

      // then
      expect(result).toBeNull();
    });
  });

  describe('getMessageCount', () => {
    it('해당 채팅방의 메시지 수를 zcard로 반환한다.', async () => {
      // given
      redisService.zcard.mockResolvedValue(7);

      // when
      const result = await chatService.getMessageCount(ROOM);

      // then
      expect(redisService.zcard).toHaveBeenCalledWith(KEY);
      expect(result).toBe(7);
    });
  });
});
