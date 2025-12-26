import { ForgotPasswordRequestDto } from '../../../src/user/dto/request/forgotPassword.dto';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import TestAgent from 'supertest/lib/agent';
import { UserFixture } from '../../config/common/fixture/user.fixture';
import { User } from '../../../src/user/entity/user.entity';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import { RedisService } from '../../../src/common/redis/redis.service';
import * as uuid from 'uuid';

const URL = '/api/user/password-reset';

describe(`POST ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let user: User;
  let redisService: RedisService;
  const passwordPatchCode = 'user-password-request';
  const redisKeyMake = (data: string) =>
    `${REDIS_KEYS.USER_RESET_PASSWORD_KEY}:${data}`;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    redisService = app.get(RedisService);
    const userRepository = app.get(UserRepository);
    user = await userRepository.save(UserFixture.createUserFixture());
  });

  beforeEach(() => {
    jest.spyOn(uuid, 'v4').mockReturnValue(passwordPatchCode as any);
  });

  it('[200] 존재하지 않는 이메일로 요청한 경우 비밀번호 재설정 이메일 요청을 성공한다.', async () => {
    // given
    const requestDto = new ForgotPasswordRequestDto({
      email: 'invalid@test.com',
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedPasswordCode = await redisService.get(
      redisKeyMake(passwordPatchCode),
    );

    // DB, Redis then
    expect(savedPasswordCode).toBeNull();
  });

  it('[200] 존재하는 이메일로 요청한 경우 비밀번호 재설정 이메일 요청을 성공한다.', async () => {
    // given
    const requestDto = new ForgotPasswordRequestDto({
      email: user.email,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedPasswordCode = await redisService.get(
      redisKeyMake(passwordPatchCode),
    );

    // DB, Redis then
    expect(savedPasswordCode).toBe(user.id.toString());
  });
});
