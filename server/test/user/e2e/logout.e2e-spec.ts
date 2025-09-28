import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserService } from '../../../src/user/service/user.service';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { User } from '../../../src/user/entity/user.entity';

describe('POST /api/user/logout E2E Test', () => {
  let app: INestApplication;
  let userService: UserService;
  let userInformation: User;

  beforeAll(async () => {
    app = global.testApp;
    userService = app.get(UserService);
    const userRepository = app.get(UserRepository);

    userInformation = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
  });

  it('[200] 로그아웃을 정상적으로 성공한다.', async () => {
    // given
    const accessToken = userService.createToken(
      {
        id: userInformation.id,
        email: userInformation.email,
        userName: userInformation.userName,
        role: 'user',
      },
      'access',
    );
    const agent = request.agent(app.getHttpServer());

    // when
    const response = await agent
      .post('/api/user/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(response.status).toBe(200);
  });

  it('[401] Access Token이 존재하지 않았을 때, 오류가 발생한다.', async () => {
    // given
    const agent = request.agent(app.getHttpServer());

    // when
    const response = await agent.post('/api/user/logout');

    // then
    expect(response.status).toBe(401);
  });
});
