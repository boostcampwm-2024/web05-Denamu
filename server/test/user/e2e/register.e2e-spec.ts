import { HttpStatus } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import * as uuid from 'uuid';
import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { RegisterUserRequestDto } from '@user/dto/request/registerUser.dto';
import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';
import { WithdrawnUserRepository } from '@user/repository/withdrawnUser.repository';

import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/users/registrations';

describe(`POST ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let userRepository: UserRepository;
  let withdrawnUserRepository: WithdrawnUserRepository;
  let redisService: RedisService;
  const userRegisterCode = 'user-register-request';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.USER_AUTH_KEY}:${data}`;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    userRepository = testApp.get(UserRepository);
    withdrawnUserRepository = testApp.get(WithdrawnUserRepository);
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

  it('[409] 이미 사용 중인 닉네임을 입력할 경우 회원가입을 실패한다.', async () => {
    // given
    const user = await userRepository.save(UserFixture.createUserFixture());
    const requestDto = new RegisterUserRequestDto({
      email: `unique-${user.email}`,
      password: 'test1234!',
      userName: user.userName,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.CONFLICT);

    // Redis then
    const savedRegisterCode = await redisService.get(
      redisKeyMake(userRegisterCode),
    );
    expect(savedRegisterCode).toBeNull();
  });

  it('[403] 탈퇴 후 재가입 제한 기간 내의 이메일이면 회원가입을 실패한다.', async () => {
    // given
    const restrictedEmail = 'restricted@test.com';
    await withdrawnUserRepository.save({
      email: restrictedEmail,
      withdrawnAt: new Date(),
    });
    const requestDto = new RegisterUserRequestDto({
      email: restrictedEmail,
      password: 'test1234!',
      userName: 'restricted-user',
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.FORBIDDEN);

    // Redis then
    const savedRegisterCode = await redisService.get(
      redisKeyMake(userRegisterCode),
    );
    expect(savedRegisterCode).toBeNull();
  });

  it('[201] 재가입 제한 기간이 지난 탈퇴 이메일이면 회원가입을 성공한다.', async () => {
    // given
    const expiredEmail = 'expired-restriction@test.com';
    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
    await withdrawnUserRepository.save({
      email: expiredEmail,
      withdrawnAt: fourMonthsAgo,
    });
    const requestDto = new RegisterUserRequestDto({
      email: expiredEmail,
      password: 'test1234!',
      userName: 'expired-restriction-user',
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.CREATED);
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
    ) as User;

    // DB, Redis then
    expect(
      await bcrypt.compare(requestDto.password, savedRegisterCode.password),
    ).toBeTruthy();
    expect(savedRegisterCode).toMatchObject({
      email: requestDto.email,
      userName: requestDto.userName,
    });
  });

  it('[201] 이메일 수신 동의 값을 함께 보내면 임시 저장 데이터에 반영된다.', async () => {
    // given
    const requestDto = new RegisterUserRequestDto({
      email: 'agree-test@test.com',
      password: 'test1234!',
      userName: 'agree-test',
      marketingEmailAgreed: true,
      inactivityEmailAgreed: false,
      noticeEmailAgreed: false,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.CREATED);

    // Redis then
    const savedRegisterCode = JSON.parse(
      await redisService.get(redisKeyMake(userRegisterCode)),
    ) as User;
    expect(savedRegisterCode.marketingEmailAgreed).toBe(true);
    expect(savedRegisterCode.inactivityEmailAgreed).toBe(false);
    expect(savedRegisterCode.noticeEmailAgreed).toBe(false);
  });
});
