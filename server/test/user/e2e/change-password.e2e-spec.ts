import { HttpStatus } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { ChangePasswordRequestDto } from '@user/dto/request/changePassword.dto';
import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import {
  USER_DEFAULT_PASSWORD,
  UserFixture,
} from '@test/config/common/fixture/user.fixture';
import { createAccessToken, testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/users/password';

describe(`PATCH ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let userRepository: UserRepository;
  let redisService: RedisService;
  let user: User;
  let accessToken: string;

  const invalidatedKey = (id: number) =>
    `${REDIS_KEYS.USER_INVALIDATED_PREFIX}:${id}`;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    userRepository = testApp.get(UserRepository);
    redisService = testApp.get(RedisService);
  });

  beforeEach(async () => {
    user = await userRepository.save(await UserFixture.createUserCryptFixture());
    accessToken = createAccessToken(user);
  });

  it('[401] 로그인하지 않은 유저가 비밀번호 변경 요청을 할 경우 실패한다.', async () => {
    // given
    const requestDto = new ChangePasswordRequestDto({
      currentPassword: USER_DEFAULT_PASSWORD,
      newPassword: 'newPass1234!',
    });

    // Http when
    const response = await agent.patch(URL).send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);

    // DB then: 비밀번호가 변경되지 않아야 한다.
    const savedUser = await userRepository.findOneBy({ id: user.id });
    expect(
      await bcrypt.compare(USER_DEFAULT_PASSWORD, savedUser.password),
    ).toBeTruthy();
  });

  it('[401] 현재 비밀번호가 일치하지 않으면 실패하고 비밀번호와 세션을 유지한다.', async () => {
    // given
    const requestDto = new ChangePasswordRequestDto({
      currentPassword: 'wrongPass1234!',
      newPassword: 'newPass1234!',
    });

    // Http when
    const response = await agent
      .patch(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);

    // DB, Redis then: 비밀번호 미변경 + 무효화 키 미설정
    const savedUser = await userRepository.findOneBy({ id: user.id });
    expect(
      await bcrypt.compare(USER_DEFAULT_PASSWORD, savedUser.password),
    ).toBeTruthy();
    expect(await redisService.get(invalidatedKey(user.id))).toBeNull();
  });

  it('[200] 현재 비밀번호가 일치하면 비밀번호를 변경하고 모든 기기를 로그아웃한다.', async () => {
    // given
    const newPassword = 'newPass1234!';
    const requestDto = new ChangePasswordRequestDto({
      currentPassword: USER_DEFAULT_PASSWORD,
      newPassword,
    });

    // Http when
    const response = await agent
      .patch(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.OK);

    // DB, Redis then: 새 비밀번호 적용 + 전 기기 무효화 키 설정
    const savedUser = await userRepository.findOneBy({ id: user.id });
    expect(await bcrypt.compare(newPassword, savedUser.password)).toBeTruthy();
    expect(await redisService.get(invalidatedKey(user.id))).not.toBeNull();
  });

  it('[200] 비밀번호 미설정 소셜 계정은 현재 비밀번호 없이 새로 설정하고 모든 기기를 로그아웃한다.', async () => {
    // given
    const socialUser = await userRepository.save(
      UserFixture.createUserFixture({ password: null }),
    );
    const socialToken = createAccessToken(socialUser);
    const newPassword = 'newPass1234!';
    const requestDto = new ChangePasswordRequestDto({ newPassword });

    // Http when
    const response = await agent
      .patch(URL)
      .set('Authorization', `Bearer ${socialToken}`)
      .send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.OK);

    // DB, Redis then
    const savedUser = await userRepository.findOneBy({ id: socialUser.id });
    expect(await bcrypt.compare(newPassword, savedUser.password)).toBeTruthy();
    expect(await redisService.get(invalidatedKey(socialUser.id))).not.toBeNull();
  });
});
