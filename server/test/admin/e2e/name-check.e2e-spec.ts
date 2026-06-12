import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { Admin } from '@admin/entity/admin.entity';
import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/admins/name-availability';

describe(`GET ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  let admin: Admin;
  const sessionKey = 'admin-name-check-session-key';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    adminRepository = testApp.get(AdminRepository);
  });

  beforeEach(async () => {
    admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    await redisService.set(redisKeyMake(sessionKey), admin.email);
  });

  it('[401] 관리자 로그인 쿠키가 없을 경우 이름 중복 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL).query({ name: '홍길동' });

    // Http then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[200] 중복 이름이 존재하지 않을 경우 false를 반환한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .query({ name: `invalid-${admin.name}` })
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({ exists: false });
  });

  it('[200] 중복 이름이 존재할 경우 true를 반환한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .query({ name: admin.name })
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({ exists: true });
  });
});
