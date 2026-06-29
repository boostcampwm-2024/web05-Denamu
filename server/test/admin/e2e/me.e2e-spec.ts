import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/admins/me';

describe(`GET ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  const sessionKey = 'admin-session-check-key';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    adminRepository = testApp.get(AdminRepository);
  });

  let registeredName: string;
  let registeredEmail: string;

  beforeEach(async () => {
    const admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    registeredName = admin.name;
    registeredEmail = admin.email;
    await redisService.set(redisKeyMake(sessionKey), admin.email);
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
    expect(data).toEqual({
      email: registeredEmail,
      name: registeredName,
      emailNotification: true,
      parent: null,
    });

    // DB, Redis when
    const savedSession = await redisService.get(redisKeyMake(sessionKey));

    // DB, Redis then
    expect(savedSession).not.toBeNull();
  });

  it('[200] 부모 관리자가 있을 경우 프로필에 부모 정보를 포함한다.', async () => {
    // given
    const parent = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    const child = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture({
        parentAdminId: parent.id,
      }),
    );
    const childSessionKey = 'child-session-check-key';
    await redisService.set(redisKeyMake(childSessionKey), child.email);

    // Http when
    const response = await agent
      .get(URL)
      .set('Cookie', `sessionId=${childSessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toEqual({
      email: child.email,
      name: child.name,
      emailNotification: true,
      parent: { email: parent.email, name: parent.name },
    });
  });
});
