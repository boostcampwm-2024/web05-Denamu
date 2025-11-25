import { HttpStatus, INestApplication } from '@nestjs/common';
import { UserService } from '../../../src/user/service/user.service';
import * as supertest from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { User } from '../../../src/user/entity/user.entity';
import TestAgent from 'supertest/lib/agent';

const URL = '/api/user/refresh-token';

describe(`POST ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let userService: UserService;
  let user: User;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    userService = app.get(UserService);

    const userRepository = app.get(UserRepository);

    user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
  });

  it('[401] Refresh Token이 없을 경우 Access Token 발급을 실패한다.', async () => {
    // when
    const response = await agent.post(URL);

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[200] Refresh Token이 있을 경우 Access Token 발급을 성공한다.', async () => {
    // given
    const refreshToken = userService.createToken(
      {
        id: user.id,
        email: user.email,
        userName: user.userName,
        role: 'user',
      },
      'refresh',
    );
    const accessToken = userService.createToken(
      {
        id: user.id,
        email: user.email,
        userName: user.userName,
        role: 'user',
      },
      'access',
    );

    // when
    const response = await agent
      .post(URL)
      .set('Cookie', `refresh_token=${refreshToken}`);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      accessToken,
    });
  });
});
