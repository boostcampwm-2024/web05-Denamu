import { HttpStatus } from '@nestjs/common';
import * as supertest from 'supertest';
import { RedisService } from '../../../src/common/redis/redis.service';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import TestAgent from 'supertest/lib/agent';
import { testApp } from '../../config/e2e/env/jest.setup';

const URL = '/api/admin/logout';

describe(`POST ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;
  const sessionKey = 'admin-logout-sessionKey';
  const sessionId = 'test1234';

  beforeAll(async () => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
  });

  beforeEach(async () => {
    await redisService.set(redisKeyMake(sessionKey), sessionId);
  });

  it('[401] 관리자 로그인 쿠키가 없을 경우 로그아웃을 실패한다.', async () => {
    // Http when
    const response = await agent.post(URL);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedSession = await redisService.get(redisKeyMake(sessionKey));

    // DB, Redis then
    expect(savedSession).toBe(sessionId);
  });

  it('[401] 관리자 로그인 쿠키가 만료됐을 경우 로그아웃을 실패한다.', async () => {
    // Http when
    const response = await agent
      .post(URL)
      .set('Cookie', `sessionId=Wrong${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedSession = await redisService.get(redisKeyMake(sessionKey));

    // DB, Redis then
    expect(savedSession).toBe(sessionId);
  });

  it('[200] 관리자 로그인이 되어 있을 경우 로그아웃을 성공한다.', async () => {
    // Http when
    const response = await agent
      .post(URL)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.header['set-cookie']).toStrictEqual([
      'sessionId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    ]);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedSession = await redisService.get(redisKeyMake(sessionKey));

    // DB, Redis then
    expect(savedSession).toBeNull();
  });
});
