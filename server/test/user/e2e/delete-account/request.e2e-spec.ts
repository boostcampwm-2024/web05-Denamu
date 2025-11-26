import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserRepository } from '../../../../src/user/repository/user.repository';
import { UserFixture } from '../../../fixture/user.fixture';
import TestAgent from 'supertest/lib/agent';
import { UserService } from '../../../../src/user/service/user.service';

const URL = '/api/user/delete-account/request';

describe(`POST ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let createAccessToken: (arg0?: number) => string;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const userRepository = app.get(UserRepository);
    const userService = app.get(UserService);
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

  it('[401] 로그인 되지 않은 유저가 회원 탈퇴를 신청할 경우 회원 탈퇴 신청을 실패한다.', async () => {
    // when
    const response = await agent.post(URL);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[200] 회원 탈퇴 신청을 받을 경우 회원 탈퇴 신청을 성공한다.', async () => {
    // given
    const accessToken = createAccessToken();

    // when
    const response = await agent
      .post(URL)
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();
  });
});
