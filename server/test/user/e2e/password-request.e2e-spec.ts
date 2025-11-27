import { ForgotPasswordRequestDto } from '../../../src/user/dto/request/forgotPassword.dto';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import TestAgent from 'supertest/lib/agent';
import { UserFixture } from '../../fixture/user.fixture';
import { User } from '../../../src/user/entity/user.entity';

const URL = '/api/user/password-reset';

describe(`POST ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let user: User;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const userRepository = app.get(UserRepository);
    user = await userRepository.save(UserFixture.createUserFixture());
  });

  it('[200] 존재하지 않는 이메일로 요청한 경우 비밀번호 재설정 이메일 요청을 성공한다.', async () => {
    // given
    const requestDto = new ForgotPasswordRequestDto({
      email: 'invalid@test.com',
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();
  });

  it('[200] 존재하는 이메일로 요청한 경우 비밀번호 재설정 이메일 요청을 성공한다.', async () => {
    // given
    const requestDto = new ForgotPasswordRequestDto({
      email: user.email,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();
  });
});
