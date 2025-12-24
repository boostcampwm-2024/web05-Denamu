import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserRepository } from '../../../../src/user/repository/user.repository';
import { UserFixture } from '../../../fixture/user.fixture';
import TestAgent from 'supertest/lib/agent';
import { User } from '../../../../src/user/entity/user.entity';
import { createAccessToken } from '../../../jest.setup';
import { REDIS_KEYS } from '../../../../src/common/redis/redis.constant';
import * as uuid from 'uuid';
import { RedisService } from '../../../../src/common/redis/redis.service';

const URL = '/api/user/delete-account/request';

describe(`POST ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let user: User;
  let redisService: RedisService;
  const userDeleteCode = 'user-delete-request';
  const redisKeyMake = (data: string) =>
    `${REDIS_KEYS.USER_DELETE_ACCOUNT_KEY}:${data}`;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    redisService = app.get(RedisService);
    const userRepository = app.get(UserRepository);
    user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
  });

  beforeEach(() => {
    jest.spyOn(uuid, 'v4').mockReturnValue(userDeleteCode as any);
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
    // given
    const accessToken = createAccessToken(user);

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
    expect(savedDeleteCode).toBe(user.id.toString());
  });
});
