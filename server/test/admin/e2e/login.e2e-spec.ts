import { HttpStatus } from '@nestjs/common';

import * as uuid from 'uuid';
import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { LoginAdminRequestDto } from '@admin/dto/request/loginAdmin.dto';
import { Admin } from '@admin/entity/admin.entity';
import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import {
  ADMIN_DEFAULT_PASSWORD,
  AdminFixture,
} from '@test/config/common/fixture/admin.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/admin/login';

describe(`POST ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let admin: Admin;
  let adminRepository: AdminRepository;
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;
  const sessionKey = 'admin-login-sessionKey';

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    adminRepository = testApp.get(AdminRepository);
  });

  beforeEach(async () => {
    jest.spyOn(uuid, 'v4').mockReturnValue(sessionKey as any);
    admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
  });

  it('[401] 등록되지 않은 ID로 로그인할 경우 로그인을 실패한다.', async () => {
    // given
    const requestDto = new LoginAdminRequestDto({
      loginId: 'testWrongAdminId',
      password: ADMIN_DEFAULT_PASSWORD,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedSession = await redisService.get(redisKeyMake(sessionKey));

    // DB, Redis then
    expect(savedSession).toBeNull();
  });

  it('[401] 비밀번호가 다를 경우 로그인을 실패한다.', async () => {
    // given
    const requestDto = new LoginAdminRequestDto({
      loginId: admin.loginId,
      password: 'testWrongAdminPassword!',
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedSession = await redisService.get(redisKeyMake(sessionKey));

    // DB, Redis then
    expect(savedSession).toBeNull();
  });

  it('[200] 존재하는 사용자의 정보로 로그인할 경우 로그인을 성공한다.', async () => {
    // given
    const requestDto = new LoginAdminRequestDto({
      loginId: admin.loginId,
      password: ADMIN_DEFAULT_PASSWORD,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.headers['set-cookie'][0]).toContain(sessionKey);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedSession = await redisService.get(redisKeyMake(sessionKey));

    // DB, Redis then
    expect(savedSession).toBe(admin.loginId);
  });

  it('[200] 기존 쿠키가 있을 때 로그인하면 기존 세션을 삭제하고 새 세션을 생성한다.', async () => {
    // given
    const oldSessionKey = 'old-session-key';
    await redisService.set(redisKeyMake(oldSessionKey), admin.loginId);
    const requestDto = new LoginAdminRequestDto({
      loginId: admin.loginId,
      password: ADMIN_DEFAULT_PASSWORD,
    });

    // Http when
    const response = await agent
      .post(URL)
      .set('Cookie', `admin-session-id=${oldSessionKey}`)
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when - 기존 세션 삭제되고 새 세션 생성 확인
    const [oldSession, newSession] = await Promise.all([
      redisService.get(redisKeyMake(oldSessionKey)),
      redisService.get(redisKeyMake(sessionKey)),
    ]);

    // DB, Redis then
    expect(oldSession).toBeNull(); // 기존 세션 삭제됨
    expect(newSession).toBe(admin.loginId); // 새 세션 생성됨
  });

  it('[200] 다른 세션에서 같은 계정으로 로그인되어 있을 때 기존 세션을 삭제한다.', async () => {
    // given
    const duplicateSessionKey = 'duplicate-session-key';
    await redisService.set(redisKeyMake(duplicateSessionKey), admin.loginId);
    const requestDto = new LoginAdminRequestDto({
      loginId: admin.loginId,
      password: ADMIN_DEFAULT_PASSWORD,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when - 중복 세션 삭제되고 새 세션 생성 확인
    const [duplicateSession, newSession] = await Promise.all([
      redisService.get(redisKeyMake(duplicateSessionKey)),
      redisService.get(redisKeyMake(sessionKey)),
    ]);

    // DB, Redis then
    expect(duplicateSession).toBeNull();
    expect(newSession).toBe(admin.loginId);
  });
});
