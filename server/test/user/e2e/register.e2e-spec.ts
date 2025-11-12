import { HttpStatus, INestApplication } from '@nestjs/common';
import { RegisterUserRequestDto } from '../../../src/user/dto/request/registerUser.dto';
import * as supertest from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import TestAgent from 'supertest/lib/agent';

describe('POST api/user/register E2E Test', () => {
  let app: INestApplication;
  let agent: TestAgent;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
  });

  it('[201] 회원가입 요청에 정상적으로 성공한다.', async () => {
    // given
    const requestDto = new RegisterUserRequestDto({
      email: 'test1234@test.com',
      password: 'test1234!',
      userName: 'test1234',
    });

    // when
    const response = await agent.post('/api/user/register').send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.CREATED);
  });

  it('[409] 이미 가입된 이메일을 입력하면 409 Conflict 예외가 발생한다.', async () => {
    // given
    const userRepository = app.get(UserRepository);
    await userRepository.insert(UserFixture.createUserFixture());
    const requestDto = new RegisterUserRequestDto({
      email: 'test1234@test.com',
      password: 'test1234!',
      userName: 'test1234',
    });

    // when
    const response = await agent.post('/api/user/register').send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.CONFLICT);
  });
});
