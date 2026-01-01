import { HttpStatus } from '@nestjs/common';
import * as supertest from 'supertest';
import { RedisService } from '../../../src/common/redis/redis.service';
import {
  USER_DEFAULT_PASSWORD,
  UserFixture,
} from '../../config/common/fixture/user.fixture';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import { CertificateUserRequestDto } from '../../../src/user/dto/request/certificateUser.dto';
import TestAgent from 'supertest/lib/agent';
import { UserRepository } from '../../../src/user/repository/user.repository';
import * as bcrypt from 'bcrypt';
import { User } from '../../../src/user/entity/user.entity';
import { testApp } from '../../config/e2e/env/jest.setup';

const URL = '/api/user/certificate';

describe(`POST ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let userRepository: UserRepository;
  let user: User;
  const userRegisterCode = 'user-register-certificate';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.USER_AUTH_KEY}:${data}`;

  beforeAll(async () => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    userRepository = testApp.get(UserRepository);
  });

  beforeEach(async () => {
    user = await UserFixture.createUserCryptFixture();
    await redisService.set(
      redisKeyMake(userRegisterCode),
      JSON.stringify(user),
    );
  });

  it('[404] 존재하지 않거나 만료된 UUID로 인증을 요청할 경우 회원 가입 인증을 실패한다.', async () => {
    // given
    const requestDto = new CertificateUserRequestDto({
      uuid: `Wrong${userRegisterCode}`,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedUser = await userRepository.findOneBy({
      userName: user.userName,
      email: user.email,
    });

    // DB, Redis then
    expect(savedUser).toBeNull();
  });

  it('[200] 올바른 인증 코드로 인증을 요청할 경우 회원 가입 인증을 성공한다.', async () => {
    // given
    const requestDto = new CertificateUserRequestDto({
      uuid: userRegisterCode,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const [savedUser, savedRegisterCode] = await Promise.all([
      userRepository.findOneBy({
        email: user.email,
        userName: user.userName,
      }),
      redisService.get(redisKeyMake(userRegisterCode)),
    ]);

    // DB, Redis then
    expect(savedRegisterCode).toBeNull();
    expect(savedUser).not.toBeNull();
    expect(
      await bcrypt.compare(USER_DEFAULT_PASSWORD, savedUser.password),
    ).toBeTruthy();
  });
});
