import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { RedisService } from '../../../src/common/redis/redis.service';

describe('POST /api/admin/logout E2E Test', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = global.testApp;
    const redisService = app.get(RedisService);
    await redisService.set('auth:sid', 'test1234');
  });

  it('관리자 로그인이 되어 있으면 로그아웃을 정상적으로 할 수 있다.', async () => {
    // when
    const response = await request(app.getHttpServer())
      .post('/api/admin/logout')
      .set('Cookie', 'sessionId=sid');

    // then
    expect(response.status).toBe(200);
    expect(response.header['set-cookie']).toStrictEqual([
      'sessionId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    ]);
  });

  it('관리자 로그인이 되어 있지 않으면 로그아웃을 정상적으로 할 수 없다.', async () => {
    // when
    const noCookieResponse = await request(app.getHttpServer()).post(
      '/api/admin/logout',
    );
    const noSessionResponse = await request(app.getHttpServer())
      .post('/api/admin/logout')
      .set('Cookie', 'sessionId=invalid');

    // then
    expect(noCookieResponse.status).toBe(401);
    expect(noSessionResponse.status).toBe(401);
  });
});
