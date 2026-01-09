import { HttpStatus } from '@nestjs/common';
import { RegisterUserRequestDto } from '@user/dto/request/registerUser.dto';
import supertest from 'supertest';
import { UserRepository } from '@user/repository/user.repository';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import TestAgent from 'supertest/lib/agent';
import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';
import * as uuid from 'uuid';
import * as bcrypt from 'bcrypt';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/user/register';

describe(`POST ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let userRepository: UserRepository;
  let redisService: RedisService;
  const userRegisterCode = 'user-register-request';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.USER_AUTH_KEY}:${data}`;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    userRepository = testApp.get(UserRepository);
    redisService = testApp.get(RedisService);
  });

  beforeEach(() => {
    jest.spyOn(uuid, 'v4').mockReturnValue(userRegisterCode as any);
  });

  it('[409] 이미 가입된 이메일을 입력할 경우 회원가입을 실패한다.', async () => {
    // given
    const user = await userRepository.save(UserFixture.createUserFixture());
    const requestDto = new RegisterUserRequestDto({
      email: user.email,
      password: user.password,
      userName: user.userName,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CONFLICT);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedRegisterCode = await redisService.get(
      redisKeyMake(userRegisterCode),
    );

    // DB, Redis then
    expect(savedRegisterCode).toBeNull();
  });

  it('[201] 중복되는 회원이 없을 경우 회원가입을 성공한다.', async () => {
    // given
    const requestDto = new RegisterUserRequestDto({
      email: 'test1234@test.com',
      password: 'test1234!',
      userName: 'test1234',
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedRegisterCode = JSON.parse(
      await redisService.get(redisKeyMake(userRegisterCode)),
    );

    // DB, Redis then
    expect(
      await bcrypt.compare(requestDto.password, savedRegisterCode.password),
    ).toBeTruthy();
    expect(savedRegisterCode).toMatchObject({
      email: requestDto.email,
      userName: requestDto.userName,
    });
  });
});
