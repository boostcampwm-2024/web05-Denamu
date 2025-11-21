import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserService } from '../../../src/user/service/user.service';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { User } from '../../../src/user/entity/user.entity';
import TestAgent from 'supertest/lib/agent';

describe('POST /api/user/logout E2E Test', () => {
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

  it('[401] Access Token이 존재하지 않을 경우 로그아웃을 실패한다.', async () => {
    // when
    const response = await agent.post('/api/user/logout');

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[200] 로그인된 상태일 경우 로그아웃을 성공한다.', async () => {
    // given
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
      .post('/api/user/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });
});
