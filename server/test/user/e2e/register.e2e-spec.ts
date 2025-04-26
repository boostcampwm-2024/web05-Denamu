import { INestApplication } from '@nestjs/common';
import { RegisterDto } from '../../../src/user/dto/request/register.dto';
import * as request from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';

describe('POST api/user/register E2E Test', () => {
  let app: INestApplication;

  const newRegisterDto = new RegisterDto({
    email: 'test1234@test.com',
    password: 'test1234!',
    userName: 'test1234',
  });

  beforeAll(async () => {
    app = global.testApp;
  });

  it('회원가입 요청에 정상적으로 성공한다.', async () => {
    // given
    const agent = request.agent(app.getHttpServer());

    // when
    const response = await agent
      .post('/api/user/register')
      .send(newRegisterDto);

    // then
    expect(response.status).toBe(201);
  });

  it('이미 가입된 이메일을 입력하면 409 Conflict 예외가 발생한다.', async () => {
    // given
    const agent = request.agent(app.getHttpServer());
    const userRepository = app.get(UserRepository);
    await userRepository.insert(await UserFixture.createUserFixture());

    // when
    const response = await agent
      .post('/api/user/register')
      .send(newRegisterDto);

    // then
    expect(response.status).toBe(409);
  });
});
