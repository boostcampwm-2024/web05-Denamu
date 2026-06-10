import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/admins/children';

describe(`GET ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  const sessionKey = 'admin-children-session-key';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    adminRepository = testApp.get(AdminRepository);
  });

  let parentId: number;

  beforeEach(async () => {
    const admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    parentId = admin.id;
    await redisService.set(redisKeyMake(sessionKey), admin.email);
  });

  it('[401] 관리자 로그인 쿠키가 없을 경우 자식 계정 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[200] 내가 생성한 자식 관리자 계정 목록을 반환한다.', async () => {
    // given
    const child1 = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture({
        parentAdminId: parentId,
      }),
    );
    const child2 = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture({
        parentAdminId: parentId,
      }),
    );

    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toEqual(
      expect.arrayContaining([
        { id: child1.id, email: child1.email, name: child1.name },
        { id: child2.id, email: child2.email, name: child2.name },
      ]),
    );
    expect(data).toHaveLength(2);
  });
});
