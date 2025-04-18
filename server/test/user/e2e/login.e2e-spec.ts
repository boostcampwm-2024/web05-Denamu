import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { LoginDto } from '../../../src/user/dto/request/login.dto';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';

describe('POST /api/user/login E2E Test', () => {
  let app: INestApplication;

  const loginDto = new LoginDto({
    email: 'test1234@test.com',
    password: 'test1234!',
  });

  beforeAll(async () => {
    app = global.testApp;
    const userRepository = app.get(UserRepository);

    await userRepository.save(await UserFixture.createUserCryptFixture());
  });

  it('로그인을 정상적으로 성공한다.', async () => {
    // given
    const agent = request.agent(app.getHttpServer());

    // when
    const response = await agent.post('/api/user/login').send(loginDto);

    // then
    expect(response.status).toBe(200);
    expect(response.headers['set-cookie'][0]).toContain('refresh_token=');
  });

  it('아이디를 틀렸을 경우 로그인 실패가 발생한다.', async () => {
    // given
    const agent = request.agent(app.getHttpServer());
    loginDto.email = 'test1235@test.com';

    // when
    const response = await agent.post('/api/user/login').send(loginDto);

    // then
    expect(response.status).toBe(404);
  });

  it('비밀번호를 틀렸을 경우 로그인 실패가 발생한다.', async () => {
    // given
    const agent = request.agent(app.getHttpServer());
    loginDto.email = 'test1234@test.com';
    loginDto.password = 'test1235!';

    // when
    const response = await agent.post('/api/user/login').send(loginDto);

    // then
    expect(response.status).toBe(404);
  });
});
