import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { AdminRepository } from '../../../src/admin/repository/admin.repository';
import { AdminFixture } from '../../fixture/admin.fixture';
import TestAgent from 'supertest/lib/agent';
import { RedisService } from '../../../src/common/redis/redis.service';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';

const URL = '/api/admin/sessionId';

describe(`GET ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const adminRepository = app.get(AdminRepository);
    const redisService = app.get(RedisService);
    await adminRepository.insert(await AdminFixture.createAdminCryptFixture());
    await redisService.set(
      `${REDIS_KEYS.ADMIN_AUTH_KEY}:testSessionId`,
      'test1234',
    );
  });

  it('[401] 세션 ID가 존재하지 않을 경우 관리자 자동 로그인을 실패한다.', async () => {
    // when
    const response = await agent
      .get(URL)
      .set('Cookie', 'sessionId=WrongSessionId');

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[401] 세션 ID가 쿠키에 포함되지 않을 경우 관리자 자동 로그인을 실패한다.', async () => {
    // when
    const response = await agent.get(URL);

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[200] 세션 ID가 존재할 경우 관리자 자동 로그인을 성공한다.', async () => {
    // when
    const response = await agent
      .get(URL)
      .set('Cookie', 'sessionId=testSessionId');

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });
});
