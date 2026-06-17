import { HttpStatus } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/admins/me';

describe(`PATCH ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  const sessionKey = 'admin-session-update-key';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    adminRepository = testApp.get(AdminRepository);
  });

  let adminId: number;
  let adminEmail: string;

  beforeEach(async () => {
    const admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    adminId = admin.id;
    adminEmail = admin.email;
    await redisService.set(redisKeyMake(sessionKey), admin.email);
  });

  it('[401] 로그인 쿠키가 없으면 수정에 실패한다.', async () => {
    // when
    const response = await agent.patch(URL).send({ name: '새이름' });

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[200] 이름을 수정하면 DB에 반영된다.', async () => {
    // when
    const response = await agent
      .patch(URL)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send({ name: 'updated-name' });

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const updated = await adminRepository.findOne({ where: { id: adminId } });
    expect(updated.name).toBe('updated-name');
  });

  it('[200] 비밀번호를 수정하면 해시된 값으로 DB에 반영된다.', async () => {
    // when
    const response = await agent
      .patch(URL)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send({ password: 'newPass1!' });

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const updated = await adminRepository.findOne({ where: { id: adminId } });
    expect(updated.password).not.toBe('newPass1!');
    expect(await bcrypt.compare('newPass1!', updated.password)).toBe(true);
  });

  it('[200] 이메일 수신 여부를 끄면 DB에 반영된다.', async () => {
    // when
    const response = await agent
      .patch(URL)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send({ emailNotification: false });

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const updated = await adminRepository.findOne({ where: { id: adminId } });
    expect(updated.emailNotification).toBe(false);
  });

  it('[409] 이미 존재하는 이름으로 수정하면 실패한다.', async () => {
    // given
    const other = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );

    // when
    const response = await agent
      .patch(URL)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send({ name: other.name });

    // then
    expect(response.status).toBe(HttpStatus.CONFLICT);
    const updated = await adminRepository.findOne({ where: { id: adminId } });
    expect(updated.email).toBe(adminEmail);
  });

  it('[400] 비밀번호 정책에 맞지 않으면 실패한다.', async () => {
    // when
    const response = await agent
      .patch(URL)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send({ password: 'nospecialchar' });

    // then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });
});
