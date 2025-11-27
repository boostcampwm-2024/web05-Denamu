import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserService } from '../../../src/user/service/user.service';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import TestAgent from 'supertest/lib/agent';

const URL = '/api/user/logout';

describe(`POST ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let createAccessToken: (arg0?: number) => string;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const userService = app.get(UserService);
    const userRepository = app.get(UserRepository);
    const user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    createAccessToken = (notFoundId?: number) =>
      userService.createToken(
        {
          id: notFoundId ?? user.id,
          email: user.email,
          userName: user.userName,
          role: 'user',
        },
        'access',
      );
  });

  it('[401] Access Token이 존재하지 않을 경우 로그아웃을 실패한다.', async () => {
    // Http when
    const response = await agent.post(URL);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[200] 로그인된 상태일 경우 로그아웃을 성공한다.', async () => {
    // given
    const accessToken = createAccessToken();

    // Http when
    const response = await agent
      .post(URL)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.headers['set-cookie'][0]).toContain('refresh_token=');
    expect(data).toBeUndefined();
  });
});
