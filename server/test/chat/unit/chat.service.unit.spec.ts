import { CHAT_HISTORY_LIMIT } from '@chat/constant/constant';
import { RedisMessagePayload } from '@chat/constant/type';
import { ChatService } from '@chat/service/chat.service';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

describe(`${ChatService.name} Unit Test`, () => {
  let chatService: ChatService;
  let redisService: jest.Mocked<
    Pick<RedisService, 'lrange' | 'lpush' | 'ltrim'>
  >;

  const ROOM = 'room-1';

  const createMessage = (
    overwrites: Partial<RedisMessagePayload> = {},
  ): RedisMessagePayload => ({
    userId: 'user-1',
    userName: 'tester',
    message: 'hello',
    timestamp: '2025-01-01T00:00:00.000Z',
    room: ROOM,
    ...overwrites,
  });

  beforeEach(() => {
    redisService = { lrange: jest.fn(), lpush: jest.fn(), ltrim: jest.fn() };
    chatService = new ChatService(redisService as unknown as RedisService);
  });

  describe('getChatHistory', () => {
    it('최근 메시지를 파싱한 뒤 역순으로 반환한다.', async () => {
      // given
      const messages = [
        createMessage({ message: 'newest' }),
        createMessage({ message: 'oldest' }),
      ];
      redisService.lrange.mockResolvedValue(
        messages.map((m) => JSON.stringify(m)),
      );

      // when
      const result = await chatService.getChatHistory(ROOM);

      // then
      expect(redisService.lrange).toHaveBeenCalledWith(
        REDIS_KEYS.CHAT_HISTORY_KEY(ROOM),
        0,
        CHAT_HISTORY_LIMIT - 1,
      );
      expect(result.map((m) => m.message)).toStrictEqual(['oldest', 'newest']);
    });

    it('저장된 메시지가 없으면 빈 배열을 반환한다.', async () => {
      // given
      redisService.lrange.mockResolvedValue([]);

      // when
      const result = await chatService.getChatHistory(ROOM);

      // then
      expect(result).toStrictEqual([]);
    });
  });

  describe('saveMessageToRedis', () => {
    it('메시지를 lpush하고 히스토리 길이를 ltrim으로 제한한다.', async () => {
      // given
      const message = createMessage();
      const key = REDIS_KEYS.CHAT_HISTORY_KEY(ROOM);

      // when
      await chatService.saveMessageToRedis(message);

      // then
      expect(redisService.lpush).toHaveBeenCalledWith(
        key,
        JSON.stringify(message),
      );
      expect(redisService.ltrim).toHaveBeenCalledWith(
        key,
        0,
        CHAT_HISTORY_LIMIT - 1,
      );
    });
  });
});
