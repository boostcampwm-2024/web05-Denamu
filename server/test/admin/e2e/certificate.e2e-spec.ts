import { HttpStatus } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { CertificateAdminRequestDto } from '@admin/dto/request/certificateAdmin.dto';
import { Admin } from '@admin/entity/admin.entity';
import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import {
  ADMIN_DEFAULT_PASSWORD,
  AdminFixture,
} from '@test/config/common/fixture/admin.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/admins/email-verifications';

describe(`POST ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  let admin: Admin;
  const adminRegisterCode = 'admin-register-certificate';
  const registerKeyMake = (data: string) =>
    `${REDIS_KEYS.ADMIN_REGISTER_KEY}:${data}`;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    adminRepository = testApp.get(AdminRepository);
  });

  beforeEach(async () => {
    admin = await AdminFixture.createAdminCryptFixture({
      email: `verify${Date.now()}@test.com`,
    });
    await redisService.set(
      registerKeyMake(adminRegisterCode),
      JSON.stringify(admin),
    );
  });

  it('[404] 존재하지 않거나 만료된 UUID로 인증을 요청할 경우 인증을 실패한다.', async () => {
    // given
    const requestDto = new CertificateAdminRequestDto({
      uuid: `Wrong${adminRegisterCode}`,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();

    // DB then
    const savedAdmin = await adminRepository.findOneBy({
      email: admin.email,
    });
    expect(savedAdmin).toBeNull();
  });

  it('[200] 올바른 인증 코드로 인증을 요청할 경우 관리자 계정을 생성한다.', async () => {
    // given
    const requestDto = new CertificateAdminRequestDto({
      uuid: adminRegisterCode,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis then
    const [savedAdmin, savedRegisterCode] = await Promise.all([
      adminRepository.findOneBy({ email: admin.email }),
      redisService.get(registerKeyMake(adminRegisterCode)),
    ]);

    expect(savedRegisterCode).toBeNull();
    expect(savedAdmin).not.toBeNull();
    expect(savedAdmin.email).toBe(admin.email);
    expect(
      await bcrypt.compare(ADMIN_DEFAULT_PASSWORD, savedAdmin.password),
    ).toBeTruthy();
  });
});
