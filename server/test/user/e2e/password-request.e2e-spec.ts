import { ForgotPasswordRequestDto } from '../../../src/user/dto/request/forgotPassword.dto';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import TestAgent from 'supertest/lib/agent';
import { UserFixture } from '../../fixture/user.fixture';
import { User } from '../../../src/user/entity/user.entity';

describe('POST /api/user/password-reset E2E Test', () => {
  let app: INestApplication;
  let agent: TestAgent;
  let userRepository: UserRepository;
  let user: User;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    userRepository = app.get(UserRepository);
    user = await userRepository.save(UserFixture.createUserFixture());
  });

  it('[200] 존재하는 이메일로 요청한 경우 비밀번호 재설정 이메일 요청을 성공한다.', async () => {
    // given
    const requestDto = new ForgotPasswordRequestDto({
      email: user.email,
    });

    // when
    const response = await agent
      .post('/api/user/password-reset')
      .send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });

  it('[404] 존재하지 않는 이메일로 요청한 경우 비밀번호 재설정 이메일 요청을 실패한다.', async () => {
    // given
    const requestDto = new ForgotPasswordRequestDto({
      email: 'invalid@test.com',
    });

    // when
    const response = await agent.post('/api/user/password').send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });
});
