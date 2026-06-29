import { HttpStatus } from '@nestjs/common';

import * as uuid from 'uuid';
import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { ForgotPasswordAdminRequestDto } from '@admin/dto/request/forgotPasswordAdmin.dto';
import { Admin } from '@admin/entity/admin.entity';
import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/admins/password-resets';

describe(`POST ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  let admin: Admin;
  const passwordResetCode = 'admin-password-reset-code';
  const redisKeyMake = (data: string) =>
    `${REDIS_KEYS.ADMIN_RESET_PASSWORD_KEY}:${data}`;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    adminRepository = testApp.get(AdminRepository);
  });

  beforeEach(async () => {
    jest.spyOn(uuid, 'v4').mockReturnValue(passwordResetCode as any);
    admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture({
        email: 'admin-forgot@test.com',
        name: 'admin-forgot',
      }),
    );
  });

  it('[400] 이메일 형식이 아닌 값으로 요청할 경우 비밀번호 재설정 요청을 실패한다.', async () => {
    // given
    const requestDto = new ForgotPasswordAdminRequestDto({
      email: 'not-an-email',
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[200] 존재하지 않는 이메일로 요청한 경우 계정 열거 방지를 위해 요청을 성공으로 처리한다.', async () => {
    // given
    const requestDto = new ForgotPasswordAdminRequestDto({
      email: 'invalid@test.com',
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // Redis then - 존재하지 않는 계정이므로 재설정 코드를 발급하지 않는다.
    const savedResetCode = await redisService.get(
      redisKeyMake(passwordResetCode),
    );
    expect(savedResetCode).toBeNull();
  });

  it('[200] 존재하는 이메일로 요청한 경우 비밀번호 재설정 코드를 발급한다.', async () => {
    // given
    const requestDto = new ForgotPasswordAdminRequestDto({
      email: admin.email,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // Redis then - 발급된 재설정 코드는 관리자 ID를 가리킨다.
    const savedResetCode = await redisService.get(
      redisKeyMake(passwordResetCode),
    );
    expect(savedResetCode).toBe(admin.id.toString());
  });
});
