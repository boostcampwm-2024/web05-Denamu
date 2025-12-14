import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../config/fixture/user.fixture';
import TestAgent from 'supertest/lib/agent';
import { User } from '../../../src/user/entity/user.entity';
import { createAccessToken } from '../../config/e2e/env/jest.setup';

const URL = '/api/user/logout';

describe(`POST ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let user: User;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const userRepository = app.get(UserRepository);
    user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
  });

  it('[401] Access Token이 존재하지 않을 경우 로그아웃을 실패한다.', async () => {
    // Http when
    const response = await agent.post(URL);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[200] 로그인된 상태일 경우 로그아웃을 성공한다.', async () => {
    // given
    const accessToken = createAccessToken(user);

    // Http when
    const response = await agent
      .post(URL)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.headers['set-cookie'][0]).toContain('refresh_token=');
    expect(data).toBeUndefined();
  });
});
