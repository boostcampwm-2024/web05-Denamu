import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserRepository } from '../../../../src/user/repository/user.repository';
import { UserFixture } from '../../../fixture/user.fixture';
import TestAgent from 'supertest/lib/agent';

describe('POST /api/user/delete-account/request E2E Test', () => {
  let app: INestApplication;
  let agent: TestAgent;
  let userRepository: UserRepository;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    userRepository = app.get(UserRepository);
  });

  it('[200] 회원 탈퇴 신청을 받을 경우 회원 탈퇴 신청을 성공한다.', async () => {
    // given
    const userEntity = await UserFixture.createUserCryptFixture();
    await userRepository.insert(userEntity);

    const loginResponse = await agent.post('/api/user/login').send({
      email: UserFixture.GENERAL_USER.email,
      password: UserFixture.GENERAL_USER.password,
    });

    const accessToken = loginResponse.body.data.accessToken;

    // when
    const response = await agent
      .post('/api/user/delete-account/request')
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });

  it('[401] 로그인 되지 않은 유저가 회원 탈퇴를 신청할 경우 회원 탈퇴 신청을 실패한다.', async () => {
    // when
    const response = await agent.post('/api/user/delete-account/request');

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
});
