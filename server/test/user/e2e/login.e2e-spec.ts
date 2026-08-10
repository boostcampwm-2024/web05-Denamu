import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { UserSuspensionRepository } from '@suspension/repository/userSuspension.repository';

import { LoginUserRequestDto } from '@user/dto/request/loginUser.dto';
import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import {
  USER_DEFAULT_PASSWORD,
  UserFixture,
} from '@test/config/common/fixture/user.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/users/login';

describe(`POST ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let userRepository: UserRepository;
  let userSuspensionRepository: UserSuspensionRepository;
  let user: User;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    userRepository = testApp.get(UserRepository);
    userSuspensionRepository = testApp.get(UserSuspensionRepository);
  });

  beforeEach(async () => {
    user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
  });

  it('[401] 아이디가 틀렸을 경우 로그인을 실패한다.', async () => {
    // given
    const requestDto = new LoginUserRequestDto({
      email: 'testWrong@test.com',
      password: USER_DEFAULT_PASSWORD,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[401] 비밀번호가 틀렸을 경우 로그인을 실패한다.', async () => {
    // given
    const requestDto = new LoginUserRequestDto({
      email: user.email,
      password: 'testWrongPassword!',
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[401] 비밀번호가 설정되지 않은 소셜 계정일 경우 로그인을 실패한다.', async () => {
    // given
    const socialUser = await userRepository.save(
      UserFixture.createUserFixture({ password: null }),
    );
    const requestDto = new LoginUserRequestDto({
      email: socialUser.email,
      password: USER_DEFAULT_PASSWORD,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[403] 정지된 유저는 로그인을 실패한다.', async () => {
    // given
    await userSuspensionRepository.save({
      user: { id: user.id },
      admin: null,
      detail: '정지 처리',
      suspendedUntil: null,
    });
    const requestDto = new LoginUserRequestDto({
      email: user.email,
      password: USER_DEFAULT_PASSWORD,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    expect(data).toEqual({ detail: '정지 처리', suspendedUntil: null });
    expect(response.headers['set-cookie']).toBeUndefined();
  });

  it('[403] 정지 이력이 여러 건이면 가장 최근 정지 정보를 반환한다.', async () => {
    // given
    await userSuspensionRepository.save({
      user: { id: user.id },
      admin: null,
      detail: '이전 정지',
      suspendedUntil: null,
    });
    await userSuspensionRepository.save({
      user: { id: user.id },
      admin: null,
      detail: '최신 정지',
      suspendedUntil: new Date(Date.now() + 60 * 60 * 1000),
    });
    const requestDto = new LoginUserRequestDto({
      email: user.email,
      password: USER_DEFAULT_PASSWORD,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    expect(data).toEqual({ detail: '최신 정지', suspendedUntil: expect.any(String) });
  });

  it('[200] 정지 기간이 지난 유저는 로그인에 성공한다.', async () => {
    // given
    await userSuspensionRepository.save({
      user: { id: user.id },
      admin: null,
      detail: '정지 처리',
      suspendedUntil: new Date(Date.now() - 60 * 1000),
    });
    const requestDto = new LoginUserRequestDto({
      email: user.email,
      password: USER_DEFAULT_PASSWORD,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.OK);
  });

  it('[200] 아이디와 비밀번호에 해당하는 유저가 존재할 경우 로그인을 성공한다.', async () => {
    // given
    const requestDto = new LoginUserRequestDto({
      email: user.email,
      password: USER_DEFAULT_PASSWORD,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.headers['set-cookie'][0]).toContain('refresh_token=');
    expect(data).toStrictEqual({
      accessToken: expect.any(String),
    });
  });

  it('[429] 60초 내 5회 초과 로그인 시도 시 요청을 차단한다.', async () => {
    // given
    const requestDto = new LoginUserRequestDto({
      email: user.email,
      password: 'testWrongPassword!',
    });

    // Http when
    for (let i = 0; i < 5; i++) {
      await agent.post(URL).send(requestDto);
    }
    const response = await agent.post(URL).send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
  });
});
