import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';

describe('GET /api/user/email-check E2E Test', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = global.testApp;
    const userRepository = app.get(UserRepository);
    await userRepository.insert(UserFixture.createUserFixture());
  });

  it('[200] 이메일 중복 조회 검사에 성공한다.', async () => {
    // given
    const email = UserFixture.createUserFixture().email + 'test';
    const agent = request.agent(app.getHttpServer());

    // when
    const response = await agent.get('/api/user/email-check').query({ email });

    // then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.exists).toBe(false);
  });

  it('[200] 이메일 중복 조회 검사에 실패한다.', async () => {
    // given
    const email = UserFixture.createUserFixture().email;
    const agent = request.agent(app.getHttpServer());

    // when
    const response = await agent.get('/api/user/email-check').query({ email });

    // then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.exists).toBe(true);
  });
});
