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
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const BASE_URL = '/api/admins/user-suspensions';

describe(`PATCH ${BASE_URL}/:userId E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  let userRepository: UserRepository;
  let userSuspensionRepository: UserSuspensionRepository;

  const sessionKey = 'admin-suspension-update-session-key';
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

  it('[401] 관리자 세션 쿠키가 없으면 정지 정보 수정을 실패한다.', async () => {
    // Http when
    const response = await agent.patch(`${BASE_URL}/${target.id}`).send({ detail: '기간 수정' });

    // Http then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[404] 존재하지 않는 유저를 수정할 경우 실패한다.', async () => {
    // Http when
    const response = await agent
      .patch(`${BASE_URL}/${Number.MAX_SAFE_INTEGER}`)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send({ detail: '기간 수정' });

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[404] 활성 정지 내역이 없으면 수정을 실패한다.', async () => {
    // Http when
    const response = await agent
      .patch(`${BASE_URL}/${target.id}`)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send({ detail: '기간 수정' });

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[400] 상세 내역 없이 수정할 경우 실패한다.', async () => {
    // given
    await userSuspensionRepository.save({
      user: { id: target.id },
      detail: '기존 정지',
      suspendedUntil: null,
    });

    // Http when
    const response = await agent
      .patch(`${BASE_URL}/${target.id}`)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send({});

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[200] 정지 기간을 연장하면 기존 활성 정지 내역이 갱신된다.', async () => {
    // given
    const original = await userSuspensionRepository.save({
      user: { id: target.id },
      detail: '기존 정지',
      suspendedUntil: new Date(Date.now() + 1000 * 60 * 60),
    });
    const suspendedUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

    // Http when
    const response = await agent
      .patch(`${BASE_URL}/${target.id}`)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send({ detail: '기간 연장', suspendedUntil });

    // Http then
    expect(response.status).toBe(HttpStatus.OK);

    // DB when
    const updated = await userSuspensionRepository.findOneBy({ id: original.id });

    // DB then
    expect(updated.detail).toBe('기간 연장');
    expect(Math.abs(updated.suspendedUntil.getTime() - new Date(suspendedUntil).getTime())).toBeLessThan(1000);
  });

  it('[200] suspendedUntil을 생략하면 영구 정지로 변경된다.', async () => {
    // given
    const original = await userSuspensionRepository.save({
      user: { id: target.id },
      detail: '7일 정지',
      suspendedUntil: new Date(Date.now() + 1000 * 60 * 60),
    });

    // Http when
    const response = await agent
      .patch(`${BASE_URL}/${target.id}`)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send({ detail: '영구 정지로 변경' });

    // Http then
    expect(response.status).toBe(HttpStatus.OK);

    // DB when
    const updated = await userSuspensionRepository.findOneBy({ id: original.id });

    // DB then
    expect(updated.suspendedUntil).toBeNull();
  });

  it('[200] 같은 유저에 활성 정지 내역이 여러 건이어도 모두 갱신된다.', async () => {
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
    const response = await agent
      .patch(`${BASE_URL}/${target.id}`)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send({ detail: '일괄 수정', suspendedUntil: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() });

    // Http then
    expect(response.status).toBe(HttpStatus.OK);

    // DB when
    const rows = await userSuspensionRepository.findBy({ user: { id: target.id } });

    // DB then
    expect(rows).toHaveLength(2);
    rows.forEach((row) => expect(row.detail).toBe('일괄 수정'));
  });

  it('[200] 정지를 해제(과거 일시로 수정)하면 정지 목록 조회에서 제외된다.', async () => {
    // given
    await userSuspensionRepository.save({
      user: { id: target.id },
      detail: '기존 정지',
      suspendedUntil: null,
    });

    // Http when
    const response = await agent
      .patch(`${BASE_URL}/${target.id}`)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send({ detail: '해제 처리', suspendedUntil: new Date(Date.now() - 1000).toISOString() });

    // Http then
    expect(response.status).toBe(HttpStatus.OK);

    // Http when
    const listResponse = await agent.get(BASE_URL).set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = listResponse.body as { data: { result: { user: { userName: string } }[] } };
    expect(data.result.find((row) => row.user.userName === target.userName)).toBeUndefined();
  });

  it('[200] 정지 종료 일시를 과거로 지정(해제)해도 기존 access token은 무효화되지 않는다.', async () => {
    // given - iat(초 단위)와 정지 시각의 초 단위 경계가 겹치지 않도록 대기한다.
    await userSuspensionRepository.save({
      user: { id: target.id },
      detail: '기존 정지',
      suspendedUntil: null,
    });
    const accessToken = createAccessToken({ id: target.id, email: target.email, userName: target.userName });
    await new Promise((resolve) => setTimeout(resolve, 1100));

    // Http when
    const response = await agent
      .patch(`${BASE_URL}/${target.id}`)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send({ detail: '해제 처리', suspendedUntil: new Date(Date.now() - 1000).toISOString() });

    // Http then
    expect(response.status).toBe(HttpStatus.OK);

    // 기존 Access Token으로 보호된 API 호출 시 정상 처리
    const logoutResponse = await agent.post('/api/users/logout').set('Authorization', `Bearer ${accessToken}`);
    expect(logoutResponse.status).toBe(HttpStatus.OK);
  }, 10000);

  it('[200] 정지 종료 일시를 미래로 연장하면 기존 access token은 즉시 무효화된다.', async () => {
    // given - iat(초 단위)와 정지 시각의 초 단위 경계가 겹치지 않도록 대기한다.
    await userSuspensionRepository.save({
      user: { id: target.id },
      detail: '기존 정지',
      suspendedUntil: new Date(Date.now() + 1000 * 60 * 60),
    });
    const accessToken = createAccessToken({ id: target.id, email: target.email, userName: target.userName });
    await new Promise((resolve) => setTimeout(resolve, 1100));

    // Http when
    const response = await agent
      .patch(`${BASE_URL}/${target.id}`)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send({ detail: '기간 연장', suspendedUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString() });

    // Http then
    expect(response.status).toBe(HttpStatus.OK);

    // 기존 Access Token으로 보호된 API 호출 시 401
    const logoutResponse = await agent.post('/api/users/logout').set('Authorization', `Bearer ${accessToken}`);
    expect(logoutResponse.status).toBe(HttpStatus.UNAUTHORIZED);
  }, 10000);
});
