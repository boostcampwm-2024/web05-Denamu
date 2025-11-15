import { HttpStatus, INestApplication } from '@nestjs/common';
import { RegisterUserRequestDto } from '../../../src/user/dto/request/registerUser.dto';
import * as supertest from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import TestAgent from 'supertest/lib/agent';

describe('POST /api/user/register E2E Test', () => {
  let app: INestApplication;
  let agent: TestAgent;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
  });

  it('[201] 중복되는 회원이 없을 경우 회원가입을 성공한다.', async () => {
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

  it('[409] 이미 가입된 이메일을 입력할 경우 회원가입을 실패한다.', async () => {
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
