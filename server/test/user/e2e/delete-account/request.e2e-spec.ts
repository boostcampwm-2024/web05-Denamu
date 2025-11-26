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
  let userRepository: UserRepository;
  let userService: UserService;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    userRepository = app.get(UserRepository);
    userService = app.get(UserService);
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
    const userEntity = await UserFixture.createUserCryptFixture();
    const user = await userRepository.save(userEntity);
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
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();
  });
});
