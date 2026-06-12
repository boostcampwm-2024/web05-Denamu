import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/users/name-availability';

describe(`GET ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let user: User;
  let userRepository: UserRepository;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    userRepository = testApp.get(UserRepository);
  });

  beforeEach(async () => {
    user = await userRepository.save(UserFixture.createUserFixture());
  });

  it('[200] 중복 닉네임이 존재하지 않을 경우 false를 반환한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .query({ userName: `invalid-${user.userName}` });

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({ exists: false });
  });

  it('[200] 중복 닉네임이 존재할 경우 true를 반환한다.', async () => {
    // Http when
    const response = await agent.get(URL).query({ userName: user.userName });

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({ exists: true });
  });

  it('[400] 닉네임이 비어있을 경우 검증에 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL).query({ userName: '' });

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });
});
