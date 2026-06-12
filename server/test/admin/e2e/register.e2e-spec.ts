import { HttpStatus } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import * as uuid from 'uuid';
import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { RegisterAdminRequestDto } from '@admin/dto/request/registerAdmin.dto';
import { Admin } from '@admin/entity/admin.entity';
import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/admins/registrations';

describe(`POST ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let adminRepository: AdminRepository;
  let redisService: RedisService;
  const sessionKey = 'admin-register-session-key';
  const adminRegisterCode = 'admin-register-request';
  const sessionKeyMake = (data: string) =>
    `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;
  const registerKeyMake = (data: string) =>
    `${REDIS_KEYS.ADMIN_REGISTER_KEY}:${data}`;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    adminRepository = testApp.get(AdminRepository);
    redisService = testApp.get(RedisService);
  });

  let sessionAdminId: number;

  beforeEach(async () => {
    const admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    sessionAdminId = admin.id;
    await redisService.set(sessionKeyMake(sessionKey), admin.email);
    jest.spyOn(uuid, 'v4').mockReturnValue(adminRegisterCode as any);
  });

  it('[401] 관리자 로그인 쿠키가 없을 경우 회원가입을 실패한다.', async () => {
    // given
    const newAdminDto = new RegisterAdminRequestDto({
      password: 'testNewAdminPassword!',
      name: 'testNewAdminName',
      email: 'testnewadmin@test.com',
    });

    // Http when
    const response = await agent.post(URL).send(newAdminDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // Redis then
    const savedRegisterCode = await redisService.get(
      registerKeyMake(adminRegisterCode),
    );
    expect(savedRegisterCode).toBeNull();
  });

  it('[401] 관리자 로그인 쿠키가 만료됐을 경우 회원가입을 실패한다.', async () => {
    // given
    const newAdminDto = new RegisterAdminRequestDto({
      password: 'testNewAdminPassword!',
      name: 'testNewAdminName',
      email: 'testnewadmin@test.com',
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

    // Redis then
    const savedRegisterCode = await redisService.get(
      registerKeyMake(adminRegisterCode),
    );
    expect(savedRegisterCode).toBeNull();
  });

  it('[409] 중복된 이메일로 회원가입을 할 경우 회원가입을 실패한다.', async () => {
    // given
    const admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    const newAdminDto = new RegisterAdminRequestDto({
      password: 'testNewAdminPassword!',
      name: 'testNewAdminName',
      email: admin.email,
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

    // Redis then
    const savedRegisterCode = await redisService.get(
      registerKeyMake(adminRegisterCode),
    );
    expect(savedRegisterCode).toBeNull();
  });

  it('[409] 중복된 이름으로 회원가입을 할 경우 회원가입을 실패한다.', async () => {
    // given
    const admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    const newAdminDto = new RegisterAdminRequestDto({
      password: 'testNewAdminPassword!',
      name: admin.name,
      email: 'testnewadmin@test.com',
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

    // Redis then
    const savedRegisterCode = await redisService.get(
      registerKeyMake(adminRegisterCode),
    );
    expect(savedRegisterCode).toBeNull();
  });

  it('[201] 관리자 로그인이 되어 있을 경우 회원가입 요청을 Redis에 저장한다.', async () => {
    // given
    const newAdminDto = new RegisterAdminRequestDto({
      password: 'testNewAdminPassword!',
      name: 'testNewAdminName',
      email: 'testnewadmin@test.com',
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

    // DB then: 인증 전이므로 아직 저장되지 않는다.
    const savedAdmin = await adminRepository.findOneBy({
      email: newAdminDto.email,
    });
    expect(savedAdmin).toBeNull();

    // Redis then: 인증 대기 정보가 저장된다.
    const pendingAdmin = JSON.parse(
      await redisService.get(registerKeyMake(adminRegisterCode)),
    ) as Admin;
    expect(pendingAdmin).toMatchObject({
      name: newAdminDto.name,
      email: newAdminDto.email,
      parentAdminId: sessionAdminId,
    });
    expect(
      await bcrypt.compare(newAdminDto.password, pendingAdmin.password),
    ).toBeTruthy();
  });
});
