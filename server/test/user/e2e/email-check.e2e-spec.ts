import { HttpStatus } from '@nestjs/common';
import supertest from 'supertest';
import { UserRepository } from '@user/repository/user.repository';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { CheckEmailDuplicationRequestDto } from '@user/dto/request/checkEmailDuplication.dto';
import TestAgent from 'supertest/lib/agent';
import { User } from '@user/entity/user.entity';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/user/email-check';

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

  it('[200] 중복 이메일이 존재하지 않을 경우 이메일 중복 검사를 성공한다.', async () => {
    // given
    const requestDto = new CheckEmailDuplicationRequestDto({
      email: `Invalid${user.email}`,
    });

    // Http when
    const response = await agent.get(URL).query(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      exists: false,
    });
  });

  it('[200] 중복 이메일이 존재할 경우 이메일 중복 검사를 성공한다.', async () => {
    // given
    const requestDto = new CheckEmailDuplicationRequestDto({
      email: user.email,
    });

    // Http when
    const response = await agent.get(URL).query(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      exists: true,
    });
  });
});
