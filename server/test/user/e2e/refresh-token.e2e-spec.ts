import { HttpStatus, INestApplication } from '@nestjs/common';
import { UserService } from '../../../src/user/service/user.service';
import * as supertest from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import TestAgent from 'supertest/lib/agent';

const URL = '/api/user/refresh-token';

describe(`POST ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let createRefreshToken: (arg0?: number) => string;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const userService = app.get(UserService);
    const userRepository = app.get(UserRepository);
    const user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );

    createRefreshToken = (notFoundId?: number) =>
      userService.createToken(
        {
          id: notFoundId ?? user.id,
          email: user.email,
          userName: user.userName,
          role: 'user',
        },
        'refresh',
      );
  });

  it('[401] Refresh Token이 없을 경우 Access Token 발급을 실패한다.', async () => {
    // when
    const response = await agent.post(URL);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[200] Refresh Token이 있을 경우 Access Token 발급을 성공한다.', async () => {
    // given
    const refreshToken = createRefreshToken();

    // when
    const response = await agent
      .post(URL)
      .set('Cookie', `refresh_token=${refreshToken}`);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      accessToken: expect.any(String),
    });
  });
});
