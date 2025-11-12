import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserRepository } from '../../../../src/user/repository/user.repository';
import { UserFixture } from '../../../fixture/user.fixture';

describe('POST /api/user/delete-account/request', () => {
  let app: INestApplication;
  let userRepository: UserRepository;

  beforeAll(async () => {
    app = global.testApp;
    userRepository = app.get(UserRepository);
  });

  it('회원탈퇴 신청 요청에 성공하고 Redis에 토큰이 저장된다.', async () => {
    // given
    const agent = request.agent(app.getHttpServer());
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

  it('인증되지 않은 사용자가 회원탈퇴 신청 시 401 에러가 발생한다.', async () => {
    // given
    const agent = request.agent(app.getHttpServer());

    // when
    const response = await agent.post('/api/user/delete-account/request');

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
});
