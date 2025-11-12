import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { AdminRepository } from '../../../src/admin/repository/admin.repository';
import { AdminFixture } from '../../fixture/admin.fixture';
import TestAgent from 'supertest/lib/agent';
import { RedisService } from '../../../src/common/redis/redis.service';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';

describe('GET /api/admin/sessionId E2E Test', () => {
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

  it('[200] 쿠키의 session id가 유효하다면 관리자를 로그인 상태로 취급한다.', async () => {
    // when
    const response = await agent
      .get('/api/admin/sessionId')
      .set('Cookie', 'sessionId=testSessionId');

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });

  it('[401] session id가 서버에 존재하지 않는다면 401 UnAuthorized 예외가 발생한다.', async () => {
    // given
    const randomUUID = uuidv4();

    // when
    const response = await agent
      .get('/api/admin/sessionId')
      .set('Cookie', `sessionId=${randomUUID}`);

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[401] session id가 클라이언트에 존재하지 않는다면 401 UnAuthorized 예외가 발생한다.', async () => {
    // when
    const response = await agent
      .get('/api/admin/sessionId')
      .set('Cookie', 'sessionId=');

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
});
