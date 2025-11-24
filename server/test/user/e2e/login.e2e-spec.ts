import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { LoginUserRequestDto } from '../../../src/user/dto/request/loginUser.dto';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import TestAgent from 'supertest/lib/agent';
import { UserService } from '../../../src/user/service/user.service';
import { User } from '../../../src/user/entity/user.entity';

describe('POST /api/user/login E2E Test', () => {
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

  it('[401] 아이디가 틀렸을 경우 로그인을 실패한다.', async () => {
    // given
    const requestDto = new LoginUserRequestDto({
      email: 'test1235@test.com',
      password: UserFixture.GENERAL_USER.password,
    });

    // when
    const response = await agent.post('/api/user/login').send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[401] 비밀번호가 틀렸을 경우 로그인을 실패한다.', async () => {
    // given
    const requestDto = new LoginUserRequestDto({
      email: UserFixture.GENERAL_USER.email,
      password: 'test1235!',
    });

    // when
    const response = await agent.post('/api/user/login').send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[200] 아이디와 비밀번호에 해당하는 유저가 존재할 경우 로그인을 성공한다.', async () => {
    // given
    const requestDto = new LoginUserRequestDto({
      email: UserFixture.GENERAL_USER.email,
      password: UserFixture.GENERAL_USER.password,
    });
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
    const response = await agent.post('/api/user/login').send(requestDto);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.headers['set-cookie'][0]).toContain('refresh_token=');
    expect(data).toStrictEqual({
      accessToken,
    });
  });
});
