import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { UserSuspensionRepository } from '@suspension/repository/userSuspension.repository';

import { UserRepository } from '@user/repository/user.repository';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const BASE_URL = '/api/admins/user-suspensions';

describe(`GET ${BASE_URL} E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  let userRepository: UserRepository;
  let userSuspensionRepository: UserSuspensionRepository;

  const sessionKey = 'admin-suspension-get-session-key';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    adminRepository = testApp.get(AdminRepository);
    userRepository = testApp.get(UserRepository);
    userSuspensionRepository = testApp.get(UserSuspensionRepository);
  });

  beforeEach(async () => {
    const admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    await redisService.set(redisKeyMake(sessionKey), admin.email);
  });

  it('[401] 관리자 세션 쿠키가 없으면 정지된 유저 목록 조회를 실패한다.', async () => {
    // Http when
    const response = await agent.get(BASE_URL);

    // Http then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[200] 현재 정지 중인 유저만 최신순으로 조회한다.', async () => {
    // given
    const [suspendedUser, expiredUser, unsuspendedUser] = await Promise.all([
      userRepository.save(await UserFixture.createUserCryptFixture()),
      userRepository.save(await UserFixture.createUserCryptFixture()),
      userRepository.save(await UserFixture.createUserCryptFixture()),
    ]);
    void unsuspendedUser;

    await userSuspensionRepository.save({
      user: { id: suspendedUser.id },
      detail: '영구 정지 대상',
      suspendedUntil: null,
    });
    await userSuspensionRepository.save({
      user: { id: expiredUser.id },
      detail: '이미 만료된 정지',
      suspendedUntil: new Date(Date.now() - 1000 * 60 * 60),
    });

    // Http when
    const response = await agent
      .get(BASE_URL)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.OK);
    const { data } = response.body as {
      data: { result: { user: { userName: string } }[] };
    };
    expect(data.result).toHaveLength(1);
    expect(data.result[0].user.userName).toBe(suspendedUser.userName);
  });

  it('[200] 같은 유저의 정지 내역이 여러 건이어도 최신 정지 1건만 조회한다.', async () => {
    // given
    const user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    await userSuspensionRepository.save({
      user: { id: user.id },
      detail: '1차 정지',
      suspendedUntil: new Date(Date.now() + 1000 * 60 * 60),
    });
    const latest = await userSuspensionRepository.save({
      user: { id: user.id },
      detail: '2차 정지',
      suspendedUntil: null,
    });

    // Http when
    const response = await agent
      .get(BASE_URL)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.OK);
    const { data } = response.body as {
      data: { result: { id: number; detail: string }[] };
    };
    expect(data.result).toHaveLength(1);
    expect(data.result[0].id).toBe(latest.id);
    expect(data.result[0].detail).toBe('2차 정지');
  });
});
