import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/users/username-availability';

describe(`GET ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let userRepository: UserRepository;
  let user: User;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    userRepository = testApp.get(UserRepository);
  });

  beforeEach(async () => {
    user = await userRepository.save(
      UserFixture.createUserFixture({ userName: '이미존재하는닉네임' }),
    );
  });

  it('[200] 이미 존재하는 닉네임이면 exists=true를 반환한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .query({ userName: user.userName });

    // Http then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data).toEqual({ exists: true });
  });

  it('[200] 존재하지 않는 닉네임이면 exists=false를 반환한다.', async () => {
    // Http when
    const response = await agent
      .get(URL)
      .query({ userName: '존재하지않는닉네임' });

    // Http then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data).toEqual({ exists: false });
  });

  it('[400] 닉네임이 비어 있으면 유효성 검사에 실패한다.', async () => {
    // Http when
    const response = await agent.get(URL).query({ userName: '' });

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });
});
