import { HttpStatus } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import * as uuid from 'uuid';
import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { ResetPasswordRequestDto } from '@user/dto/request/resetPassword.dto';
import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const makeURL = (uuid: string) => `/api/users/password-resets/${uuid}`;

describe(`PATCH /api/users/password-resets/:uuid E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let userRepository: UserRepository;
  let user: User;
  const passwordPatchCode = uuid.v4();
  const redisKeyMake = (data: string) =>
    `${REDIS_KEYS.USER_RESET_PASSWORD_KEY}:${data}`;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    userRepository = testApp.get(UserRepository);
  });

  beforeEach(async () => {
    user = await userRepository.save(UserFixture.createUserFixture());
  });

  it('[404] 존재하지 않는 비밀번호 세션 ID를 통해 비밀번호 변경 요청을 할 경우 비밀번호 변경을 실패한다.', async () => {
    // given
    const nonExistentCode = uuid.v4();
    const requestDto = new ResetPasswordRequestDto({ password: 'test1234@' });

    // Http when
    const response = await agent
      .patch(makeURL(nonExistentCode))
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedPasswordCode = await redisService.get(
      redisKeyMake(nonExistentCode),
    );

    // DB, Redis then
    expect(savedPasswordCode).toBeNull();
  });

  it('[404] 비밀번호 세션 ID는 유효하지만 유저가 존재하지 않을 경우 코드를 삭제하고 비밀번호 변경을 실패한다.', async () => {
    // given
    const nonExistentUserId = 999999;
    const requestDto = new ResetPasswordRequestDto({ password: 'test1234@' });
    await redisService.set(
      redisKeyMake(passwordPatchCode),
      JSON.stringify(nonExistentUserId),
    );

    // Http when
    const response = await agent
      .patch(makeURL(passwordPatchCode))
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedPasswordCode = await redisService.get(
      redisKeyMake(passwordPatchCode),
    );

    // DB, Redis then
    expect(savedPasswordCode).toBeNull();
  });

  it('[200] 존재하는 비밀번호 세션 ID를 통해 비밀번호 변경 요청을 할 경우 비밀번호 변경을 성공한다.', async () => {
    // given
    const updatedPassword = 'test1234@';
    const requestDto = new ResetPasswordRequestDto({
      password: updatedPassword,
    });
    await redisService.set(
      redisKeyMake(passwordPatchCode),
      JSON.stringify(user.id),
    );

    // Http when
    const response = await agent
      .patch(makeURL(passwordPatchCode))
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const [savedUser, savedPasswordCode] = await Promise.all([
      userRepository.findOneBy({ id: user.id }),
      redisService.get(redisKeyMake(passwordPatchCode)),
    ]);

    // DB, Redis then
    expect(savedUser).not.toBeNull();
    expect(
      await bcrypt.compare(updatedPassword, savedUser.password),
    ).toBeTruthy();
    expect(savedPasswordCode).toBeNull();
  });
});
