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

describe(`DELETE ${BASE_URL}/:userId E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  let userRepository: UserRepository;
  let userSuspensionRepository: UserSuspensionRepository;

  const sessionKey = 'admin-suspension-delete-session-key';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;
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
    await redisService.set(redisKeyMake(sessionKey), admin.email);

    target = await userRepository.save(await UserFixture.createUserCryptFixture());
  });

  it('[401] 관리자 세션 쿠키가 없으면 정지 내역 삭제를 실패한다.', async () => {
    // Http when
    const response = await agent.delete(`${BASE_URL}/${target.id}`);

    // Http then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[404] 존재하지 않는 유저의 정지 내역을 삭제할 경우 실패한다.', async () => {
    // Http when
    const response = await agent
      .delete(`${BASE_URL}/${Number.MAX_SAFE_INTEGER}`)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[404] 활성 정지 내역이 없으면 삭제를 실패한다.', async () => {
    // Http when
    const response = await agent.delete(`${BASE_URL}/${target.id}`).set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[200] 활성 정지 내역을 완전히 삭제한다.', async () => {
    // given
    const active = await userSuspensionRepository.save({
      user: { id: target.id },
      detail: '반복적인 스팸으로 인한 정지',
      suspendedUntil: null,
    });

    // Http when
    const response = await agent.delete(`${BASE_URL}/${target.id}`).set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.OK);

    // DB when
    const remaining = await userSuspensionRepository.findOneBy({ id: active.id });

    // DB then
    expect(remaining).toBeNull();
  });

  it('[200] 만료된 정지 내역은 남기고 활성 정지 내역만 삭제한다.', async () => {
    // given
    const expired = await userSuspensionRepository.save({
      user: { id: target.id },
      detail: '이미 만료된 정지',
      suspendedUntil: new Date(Date.now() - 1000 * 60 * 60),
    });
    const active = await userSuspensionRepository.save({
      user: { id: target.id },
      detail: '현재 정지 중',
      suspendedUntil: new Date(Date.now() + 1000 * 60 * 60),
    });

    // Http when
    const response = await agent.delete(`${BASE_URL}/${target.id}`).set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.OK);

    // DB when
    const rows = await userSuspensionRepository.findBy({ user: { id: target.id } });

    // DB then
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe(expired.id);
    expect(rows.find((row) => row.id === active.id)).toBeUndefined();
  });

  it('[200] 같은 유저에 활성 정지 내역이 여러 건이어도 모두 삭제한다.', async () => {
    // given
    await userSuspensionRepository.save({
      user: { id: target.id },
      detail: '1차 정지',
      suspendedUntil: new Date(Date.now() + 1000 * 60 * 60),
    });
    await userSuspensionRepository.save({
      user: { id: target.id },
      detail: '2차 정지',
      suspendedUntil: null,
    });

    // Http when
    const response = await agent.delete(`${BASE_URL}/${target.id}`).set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.OK);

    // DB when
    const rows = await userSuspensionRepository.findBy({ user: { id: target.id } });

    // DB then
    expect(rows).toHaveLength(0);
  });

  it('[200] 정지 내역을 삭제하면 정지 목록 조회에서 제외된다.', async () => {
    // given
    await userSuspensionRepository.save({
      user: { id: target.id },
      detail: '반복적인 스팸으로 인한 정지',
      suspendedUntil: null,
    });

    // Http when
    const response = await agent.delete(`${BASE_URL}/${target.id}`).set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.OK);

    // Http when
    const listResponse = await agent.get(BASE_URL).set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = listResponse.body as { data: { result: { user: { userName: string } }[] } };
    expect(data.result.find((row) => row.user.userName === target.userName)).toBeUndefined();
  });
});
