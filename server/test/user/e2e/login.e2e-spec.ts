import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { LoginUserRequestDto } from '../../../src/user/dto/request/loginUser.dto';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../config/common/fixture/user.fixture';
import TestAgent from 'supertest/lib/agent';

const URL = '/api/user/login';

describe(`POST ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const userRepository = app.get(UserRepository);
    await userRepository.insert(await UserFixture.createUserCryptFixture());
  });

  it('[401] 아이디가 틀렸을 경우 로그인을 실패한다.', async () => {
    // given
    const requestDto = new LoginUserRequestDto({
      email: 'testWrong@test.com',
      password: UserFixture.GENERAL_USER.password,
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
      email: UserFixture.GENERAL_USER.email,
      password: 'testWrongPassword!',
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[200] 아이디와 비밀번호에 해당하는 유저가 존재할 경우 로그인을 성공한다.', async () => {
    // given
    const requestDto = new LoginUserRequestDto({
      email: UserFixture.GENERAL_USER.email,
      password: UserFixture.GENERAL_USER.password,
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
});
