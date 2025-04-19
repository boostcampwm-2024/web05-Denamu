import { INestApplication } from '@nestjs/common';
import { UserService } from '../../../src/user/service/user.service';
import * as request from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { User } from '../../../src/user/entity/user.entity';

describe('POST /api/user/refresh-token E2E Test', () => {
  let app: INestApplication;
  let userService: UserService;
  let refreshToken: string;
  let userInformation: User;

  beforeAll(async () => {
    app = global.testApp;
    userService = app.get(UserService);

    const userRepository = app.get(UserRepository);

    userInformation = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
  });

  it('Refresh Token이 없을 때, Access Token을 발급하지 않는다.', async () => {
    // given
    const agent = request.agent(app.getHttpServer());

    // when
    const response = await agent.post('/api/user/refresh-token');

    // then
    expect(response.status).toBe(401);
  });

  it('Refresh Token이 있을 때, Access Token을 성공적으로 발급한다.', async () => {
    // given
    const agent = request.agent(app.getHttpServer());
    userService.createToken(
      {
        id: String(userInformation.id),
        email: userInformation.email,
        userName: userInformation.userName,
        role: 'user',
      },
      'refresh',
    );

    // when
    const response = await agent
      .post('/api/user/refresh-token')
      .set('Cookie', `refresh_token=${refreshToken}`);

    // then
    expect(response.status).toBe(200);
  });
});
