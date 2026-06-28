import { HttpStatus } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import * as uuid from 'uuid';
import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { ResetPasswordAdminRequestDto } from '@admin/dto/request/resetPasswordAdmin.dto';
import { Admin } from '@admin/entity/admin.entity';
import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const makeURL = (code: string) => `/api/admins/password-resets/${code}`;

describe(`PATCH /api/admins/password-resets/:uuid E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  let admin: Admin;
  const passwordResetCode = uuid.v4();
  const redisKeyMake = (data: string) =>
    `${REDIS_KEYS.ADMIN_RESET_PASSWORD_KEY}:${data}`;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    adminRepository = testApp.get(AdminRepository);
  });

  beforeEach(async () => {
    admin = await adminRepository.save(AdminFixture.createAdminFixture());
  });

  it('[400] UUID v4 형식이 아닌 코드로 요청할 경우 비밀번호 변경을 실패한다.', async () => {
    // given
    const requestDto = new ResetPasswordAdminRequestDto({
      password: 'reset1234!',
    });

    // Http when
    const response = await agent.patch(makeURL('invalid-code')).send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[404] 존재하지 않는 재설정 코드로 요청할 경우 비밀번호 변경을 실패한다.', async () => {
    // given
    const nonExistentCode = uuid.v4();
    const requestDto = new ResetPasswordAdminRequestDto({
      password: 'reset1234!',
    });

    // Http when
    const response = await agent
      .patch(makeURL(nonExistentCode))
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[200] 유효한 재설정 코드로 요청할 경우 비밀번호를 변경하고 기존 세션을 무효화한다.', async () => {
    // given
    const updatedPassword = 'reset1234!';
    const sessionId = 'admin-reset-session-id';
    const requestDto = new ResetPasswordAdminRequestDto({
      password: updatedPassword,
    });
    await Promise.all([
      redisService.set(redisKeyMake(passwordResetCode), admin.id.toString()),
      redisService.set(
        `${REDIS_KEYS.ADMIN_SESSION_BY_EMAIL}:${admin.email}`,
        sessionId,
      ),
      redisService.set(`${REDIS_KEYS.ADMIN_AUTH_KEY}:${sessionId}`, admin.email),
    ]);

    // Http when
    const response = await agent
      .patch(makeURL(passwordResetCode))
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis then
    const [savedAdmin, savedResetCode, savedSession, savedAuth] =
      await Promise.all([
        adminRepository.findOneBy({ id: admin.id }),
        redisService.get(redisKeyMake(passwordResetCode)),
        redisService.get(`${REDIS_KEYS.ADMIN_SESSION_BY_EMAIL}:${admin.email}`),
        redisService.get(`${REDIS_KEYS.ADMIN_AUTH_KEY}:${sessionId}`),
      ]);

    expect(
      await bcrypt.compare(updatedPassword, savedAdmin.password),
    ).toBeTruthy();
    expect(savedResetCode).toBeNull();
    expect(savedSession).toBeNull();
    expect(savedAuth).toBeNull();
  });
});
