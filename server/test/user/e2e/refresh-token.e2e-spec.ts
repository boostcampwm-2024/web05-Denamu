import { HttpStatus } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../config/common/fixture/user.fixture';
import TestAgent from 'supertest/lib/agent';
import { User } from '../../../src/user/entity/user.entity';
import { createRefreshToken } from '../../config/e2e/env/jest.setup';
import { testApp } from '../../config/e2e/env/jest.setup';

const URL = '/api/user/refresh-token';

describe(`POST ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let user: User;
  let userRepository: UserRepository;
  let refreshToken: string;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    userRepository = testApp.get(UserRepository);
  });

  beforeEach(async () => {
    user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    refreshToken = createRefreshToken(user);
  });

  it('[401] Refresh Token이 없을 경우 Access Token 발급을 실패한다.', async () => {
    // Http when
    const response = await agent.post(URL);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[200] Refresh Token이 있을 경우 Access Token 발급을 성공한다.', async () => {
    // Http when
    const response = await agent
      .post(URL)
      .set('Cookie', `refresh_token=${refreshToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      accessToken: expect.any(String),
    });
  });
});
