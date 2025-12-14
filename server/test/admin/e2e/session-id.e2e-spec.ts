import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { AdminRepository } from '../../../src/admin/repository/admin.repository';
import { AdminFixture } from '../../config/fixture/admin.fixture';
import TestAgent from 'supertest/lib/agent';
import { RedisService } from '../../../src/common/redis/redis.service';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import { Admin } from '../../../src/admin/entity/admin.entity';

const URL = '/api/admin/sessionId';

describe(`GET ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let admin: Admin;
  let redisService: RedisService;
  const sessionKey = 'admin-session-check-key';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    redisService = app.get(RedisService);
    const adminRepository = app.get(AdminRepository);

    admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    await redisService.set(redisKeyMake(sessionKey), admin.loginId);
  });

  it('[401] 관리자 로그인 쿠키가 없을 경우 관리자 자동 로그인을 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedSession = await redisService.get(redisKeyMake(sessionKey));

    // DB, Redis then
    expect(savedSession).not.toBeNull();
  });

  it('[401] 관리자 로그인 쿠키가 만료됐을 경우 관리자 자동 로그인을 실패한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', `sessionId=Wrong${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedSession = await redisService.get(redisKeyMake(sessionKey));

    // DB, Redis then
    expect(savedSession).not.toBeNull();
  });

  it('[200] 관리자 로그인 쿠키가 존재할 경우 관리자 자동 로그인을 성공한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedSession = await redisService.get(redisKeyMake(sessionKey));

    // DB, Redis then
    expect(savedSession).not.toBeNull();
  });
});
