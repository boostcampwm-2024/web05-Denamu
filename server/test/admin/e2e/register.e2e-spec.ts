import { RegisterAdminRequestDto } from '@admin/dto/request/registerAdmin.dto';
import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

import { HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

const URL = '/api/admin/register';

describe(`POST ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let adminRepository: AdminRepository;
  let redisService: RedisService;
  const sessionKey = 'admin-register-session-key';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    adminRepository = testApp.get(AdminRepository);
    redisService = testApp.get(RedisService);
  });

  beforeEach(async () => {
    await redisService.set(redisKeyMake(sessionKey), 'testAdminId');
  });

  it('[401] 관리자 로그인 쿠키가 없을 경우 회원가입을 실패한다.', async () => {
    // given
    const newAdminDto = new RegisterAdminRequestDto({
      loginId: 'testNewAdminId',
      password: 'testNewAdminPassword!',
    });

    // Http when
    const response = await agent.post(URL).send(newAdminDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedAdmin = await adminRepository.findOneBy({
      loginId: newAdminDto.loginId,
    });

    // DB, Redis then
    expect(savedAdmin).toBeNull();
  });

  it('[401] 관리자 로그인 쿠키가 만료됐을 경우 회원가입을 실패한다.', async () => {
    // given
    const newAdminDto = new RegisterAdminRequestDto({
      loginId: 'testNewAdminId',
      password: 'testNewAdminPassword!',
    });

    // Http when
    const response = await agent
      .post(URL)
      .send(newAdminDto)
      .set('Cookie', `sessionId=Wrong${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedAdmin = await adminRepository.findOneBy({
      loginId: newAdminDto.loginId,
    });

    // DB, Redis then
    expect(savedAdmin).toBeNull();
  });

  it('[409] 중복된 ID로 회원가입을 할 경우 다른 관리자 계정 회원가입을 실패한다.', async () => {
    // given
    const admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    const newAdminDto = new RegisterAdminRequestDto({
      loginId: admin.loginId,
      password: 'testNewAdminPassword!',
    });

    // Http when
    const response = await agent
      .post(URL)
      .send(newAdminDto)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CONFLICT);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedAdmin = await adminRepository.findBy({
      loginId: newAdminDto.loginId,
    });

    // DB, Redis then
    expect(savedAdmin.length).toBe(1);
  });

  it('[201] 관리자 로그인이 되어 있을 경우 다른 관리자 계정 회원가입을 성공한다.', async () => {
    // given
    const newAdminDto = new RegisterAdminRequestDto({
      loginId: 'testNewAdminId',
      password: 'testNewAdminPassword!',
    });

    // Http when
    const response = await agent
      .post(URL)
      .send(newAdminDto)
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedAdmin = await adminRepository.findOneBy({
      loginId: 'testNewAdminId',
    });

    // DB, Redis then
    expect(savedAdmin).not.toBeNull();
    expect(
      await bcrypt.compare(newAdminDto.password, savedAdmin.password),
    ).toBeTruthy();
  });
});
