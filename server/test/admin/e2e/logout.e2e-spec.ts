import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { RedisService } from '../../../src/common/redis/redis.service';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import TestAgent from 'supertest/lib/agent';

describe('POST /api/admin/logout E2E Test', () => {
  let app: INestApplication;
  let agent: TestAgent;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const redisService = app.get(RedisService);
    await redisService.set(
      `${REDIS_KEYS.ADMIN_AUTH_KEY}:testSessionId`,
      'test1234',
    );
  });

  it('[200] 관리자 로그인이 되어 있을 경우 로그아웃을 성공한다.', async () => {
    // when
    const response = await agent
      .post('/api/admin/logout')
      .set('Cookie', 'sessionId=testSessionId');

    // then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.header['set-cookie']).toStrictEqual([
      'sessionId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    ]);
  });

  it('[401] 관리자 로그인이 되어 있지 않을 경우 로그아웃을 실패한다.', async () => {
    // when
    const response = await agent.post('/api/admin/logout');

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[401] 존재하지 않는 세션ID로 로그아웃할 경우 로그아웃을 실패한다.', async () => {
    // when
    const response = await agent
      .post('/api/admin/logout')
      .set('Cookie', 'sessionId=nonExistentSessionId');

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
});
