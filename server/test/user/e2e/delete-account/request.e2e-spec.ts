import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';
import * as uuid from 'uuid';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken } from '@test/config/e2e/env/jest.setup';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/user/delete-account/request';

describe(`POST ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let user: User;
  let redisService: RedisService;
  let userRepository: UserRepository;
  let accessToken: string;
  const userDeleteCode = 'user-delete-request';
  const redisKeyMake = (data: string) =>
    `${REDIS_KEYS.USER_DELETE_ACCOUNT_KEY}:${data}`;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    userRepository = testApp.get(UserRepository);
  });

  beforeEach(async () => {
    jest.spyOn(uuid, 'v4').mockReturnValue(userDeleteCode as any);
    user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    accessToken = createAccessToken(user);
  });

  it('[401] 로그인 되지 않은 유저가 회원 탈퇴를 신청할 경우 회원 탈퇴 신청을 실패한다.', async () => {
    // Http when
    const response = await agent.post(URL);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedDeleteCode = await redisService.get(
      redisKeyMake(userDeleteCode),
    );

    // DB, Redis then
    expect(savedDeleteCode).toBeNull();
  });

  it('[200] 회원 탈퇴 신청을 받을 경우 회원 탈퇴 신청을 성공한다.', async () => {
    // Http when
    const response = await agent
      .post(URL)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedDeleteCode = await redisService.get(
      redisKeyMake(userDeleteCode),
    );

    // DB, Redis then
    const [userId, savedAccessToken] = savedDeleteCode.split(':');
    expect(userId).toBe(user.id.toString());
    expect(savedAccessToken).toBe(accessToken);
  });
});
