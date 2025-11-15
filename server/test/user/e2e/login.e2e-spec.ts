import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { LoginUserRequestDto } from '../../../src/user/dto/request/loginUser.dto';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import TestAgent from 'supertest/lib/agent';

describe('POST /api/user/login E2E Test', () => {
  let app: INestApplication;
  let agent: TestAgent;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const userRepository = app.get(UserRepository);

    await userRepository.save(await UserFixture.createUserCryptFixture());
  });

  it('[200] 아이디와 비밀번호에 해당하는 유저가 존재할 경우 로그인을 성공한다.', async () => {
    // given
    const requestDto = new LoginUserRequestDto({
      email: 'test1234@test.com',
      password: 'test1234!',
    });

    // when
    const response = await agent.post('/api/user/login').send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.headers['set-cookie'][0]).toContain('refresh_token=');
  });

  it('[401] 아이디가 틀렸을 경우 로그인을 실패한다.', async () => {
    // given
    const requestDto = new LoginUserRequestDto({
      email: 'test1235@test.com',
      password: 'test1234!',
    });

    // when
    const response = await agent.post('/api/user/login').send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[401] 비밀번호가 틀렸을 경우 로그인을 실패한다.', async () => {
    // given
    const requestDto = new LoginUserRequestDto({
      email: 'test1234@test.com',
      password: 'test1235!',
    });

    // when
    const response = await agent.post('/api/user/login').send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
});
