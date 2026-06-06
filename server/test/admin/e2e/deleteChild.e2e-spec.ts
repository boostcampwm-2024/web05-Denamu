import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = (id: number | string) => `/api/admins/children/${id}`;

describe(`DELETE /api/admins/children/:id E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  const sessionKey = 'admin-delete-session-key';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;
  const invalidatedKey = (loginId: string) =>
    `${REDIS_KEYS.ADMIN_INVALIDATED_PREFIX}:${loginId}`;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    adminRepository = testApp.get(AdminRepository);
  });

  let parentId: number;

  beforeEach(async () => {
    const admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture({ loginId: 'testAdminId' }),
    );
    parentId = admin.id;
    await redisService.set(redisKeyMake(sessionKey), admin.loginId);
  });

  it('[401] 관리자 로그인 쿠키가 없을 경우 삭제를 실패한다.', async () => {
    // given
    const child = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture({
        loginId: 'childAdmin',
        parentAdminId: parentId,
      }),
    );

    // Http when
    const response = await agent.delete(URL(child.id));

    // Http then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);

    // DB then
    expect(await adminRepository.findOneBy({ id: child.id })).not.toBeNull();
  });

  it('[404] 존재하지 않는 관리자 계정 삭제를 실패한다.', async () => {
    // Http when
    const response = await agent
      .delete(URL(999999))
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[403] 본인이 생성하지 않은 관리자 계정 삭제를 실패한다.', async () => {
    // given
    const stranger = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture({ loginId: 'strangerAdmin' }),
    );

    // Http when
    const response = await agent
      .delete(URL(stranger.id))
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.FORBIDDEN);

    // DB then
    expect(await adminRepository.findOneBy({ id: stranger.id })).not.toBeNull();
  });

  it('[200] 본인이 생성한 계정을 삭제하면 하위 계정까지 삭제되고 세션이 무효화된다.', async () => {
    // given
    const child = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture({
        loginId: 'childAdmin',
        parentAdminId: parentId,
      }),
    );
    const grandChild = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture({
        loginId: 'grandChildAdmin',
        parentAdminId: child.id,
      }),
    );

    // Http when
    const response = await agent
      .delete(URL(child.id))
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    expect(response.status).toBe(HttpStatus.OK);

    // DB then - 자식, 손자 모두 CASCADE 삭제
    expect(await adminRepository.findOneBy({ id: child.id })).toBeNull();
    expect(await adminRepository.findOneBy({ id: grandChild.id })).toBeNull();

    // Redis then - 삭제된 서브트리 전체 세션 무효화 키 등록
    expect(await redisService.get(invalidatedKey(child.loginId))).toBe('1');
    expect(await redisService.get(invalidatedKey(grandChild.loginId))).toBe(
      '1',
    );
  });
});
