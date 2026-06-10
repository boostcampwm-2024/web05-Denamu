import { UnauthorizedException } from '@nestjs/common';

import { validateNotInvalidated } from '@common/auth/jwt.strategy';
import { Payload } from '@common/guard/jwt.guard';
import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

describe('validateNotInvalidated Unit Test', () => {
  let redisService: jest.Mocked<Pick<RedisService, 'get'>>;

  const INVALIDATED_AT = 1_000_000; // 무효화 시각(초)
  const basePayload: Payload = {
    id: 1,
    email: 'a@test.com',
    userName: 'tester',
    role: 'user',
  };
  const payloadWithIat = (iat: number) => ({ ...basePayload, iat });

  beforeEach(() => {
    redisService = { get: jest.fn() };
  });

  it('무효화 기록이 없으면 통과한다.', async () => {
    redisService.get.mockResolvedValue(null);
    await expect(
      validateNotInvalidated(
        redisService as unknown as RedisService,
        payloadWithIat(INVALIDATED_AT),
      ),
    ).resolves.toBeUndefined();
    expect(redisService.get).toHaveBeenCalledWith(
      `${REDIS_KEYS.USER_INVALIDATED_PREFIX}:1`,
    );
  });

  it('무효화 시각 이전(iat < invalidatedAt)에 발급된 토큰은 거부한다.', async () => {
    redisService.get.mockResolvedValue(String(INVALIDATED_AT));
    await expect(
      validateNotInvalidated(
        redisService as unknown as RedisService,
        payloadWithIat(INVALIDATED_AT - 1),
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('같은 초(iat === invalidatedAt)에 발급된 토큰은 통과시킨다. (재로그인 보장)', async () => {
    redisService.get.mockResolvedValue(String(INVALIDATED_AT));
    await expect(
      validateNotInvalidated(
        redisService as unknown as RedisService,
        payloadWithIat(INVALIDATED_AT),
      ),
    ).resolves.toBeUndefined();
  });

  it('무효화 이후(iat > invalidatedAt)에 발급된 토큰은 통과한다. (비번변경 후 새 로그인)', async () => {
    redisService.get.mockResolvedValue(String(INVALIDATED_AT));
    await expect(
      validateNotInvalidated(
        redisService as unknown as RedisService,
        payloadWithIat(INVALIDATED_AT + 1),
      ),
    ).resolves.toBeUndefined();
  });
});
