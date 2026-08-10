import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { UserSuspensionRepository } from '@suspension/repository/userSuspension.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const BASE_URL = '/api/admins/user-suspensions';

describe(`POST ${BASE_URL} E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  let userRepository: UserRepository;
  let userSuspensionRepository: UserSuspensionRepository;

  const sessionKey = 'admin-suspension-create-session-key';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;
  let adminId: number;
  let target: User;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    adminRepository = testApp.get(AdminRepository);
    userRepository = testApp.get(UserRepository);
    userSuspensionRepository = testApp.get(UserSuspensionRepository);
  });

  beforeEach(async () => {
    const admin = await adminRepository.save(await AdminFixture.createAdminCryptFixture());
    adminId = admin.id;
    await redisService.set(redisKeyMake(sessionKey), admin.email);

    target = await userRepository.save(await UserFixture.createUserCryptFixture());
  });

  it('[401] 관리자 세션 쿠키가 없으면 유저 정지를 실패한다.', async () => {
    // Http when
    const response = await agent.post(BASE_URL).send({ userId: target.id, detail: '정지 처리' });

    // Http then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[404] 존재하지 않는 유저를 정지할 경우 실패한다.', async () => {
    // Http when
    const response = await agent
      .post(BASE_URL)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send({ userId: Number.MAX_SAFE_INTEGER, detail: '정지 처리' });

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[400] 상세 내역 없이 정지할 경우 실패한다.', async () => {
    // Http when
    const response = await agent
      .post(BASE_URL)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send({ userId: target.id });

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[400] 정지 종료 일시가 과거인 경우 실패한다.', async () => {
    // Http when
    const response = await agent
      .post(BASE_URL)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send({
        userId: target.id,
        detail: '정지 처리',
        suspendedUntil: new Date(Date.now() - 60 * 1000).toISOString(),
      });

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[201] 검색으로 찾은 유저를 영구 정지시킨다.', async () => {
    // Http when
    const response = await agent
      .post(BASE_URL)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send({ userId: target.id, detail: '반복적인 스팸으로 인한 정지' });

    // Http then
    expect(response.status).toBe(HttpStatus.CREATED);

    // DB when
    const savedSuspension = await userSuspensionRepository.findOne({
      where: { user: { id: target.id } },
      relations: ['admin'],
    });

    // DB then
    expect(savedSuspension).not.toBeNull();
    expect(savedSuspension.detail).toBe('반복적인 스팸으로 인한 정지');
    expect(savedSuspension.suspendedUntil).toBeNull();
    expect(savedSuspension.admin?.id).toBe(adminId);
  });

  it('[201] 기간을 지정해 유저를 정지시킨다.', async () => {
    // given
    const suspendedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Http when
    const response = await agent
      .post(BASE_URL)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send({ userId: target.id, detail: '7일 정지', suspendedUntil });

    // Http then
    expect(response.status).toBe(HttpStatus.CREATED);

    // DB when
    const savedSuspension = await userSuspensionRepository.findOneBy({ user: { id: target.id } });

    // DB then
    expect(savedSuspension).not.toBeNull();
    // datetime 컬럼은 초 단위까지만 저장되므로 밀리초 오차를 허용한다.
    expect(Math.abs(savedSuspension.suspendedUntil.getTime() - new Date(suspendedUntil).getTime())).toBeLessThan(
      1000
    );
  });
});
