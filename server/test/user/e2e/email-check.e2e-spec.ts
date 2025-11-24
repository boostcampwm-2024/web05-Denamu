import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { CheckEmailDuplicationRequestDto } from '../../../src/user/dto/request/checkEmailDuplication.dto';
import TestAgent from 'supertest/lib/agent';

describe('GET /api/user/email-check E2E Test', () => {
  let app: INestApplication;
  let agent: TestAgent;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const userRepository = app.get(UserRepository);
    await userRepository.insert(UserFixture.createUserFixture());
  });

  it('[200] 중복 이메일이 존재하지 않을 경우 이메일 중복 검사를 성공한다.', async () => {
    // given
    const requestDto = new CheckEmailDuplicationRequestDto({
      email: UserFixture.createUserFixture().email + 'test',
    });

    // when
    const response = await agent.get('/api/user/email-check').query(requestDto);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      exists: false,
    });
  });

  it('[200] 중복 이메일이 존재할 경우 이메일 중복 검사를 성공한다.', async () => {
    // given
    const requestDto = new CheckEmailDuplicationRequestDto({
      email: UserFixture.createUserFixture().email,
    });

    // when
    const response = await agent.get('/api/user/email-check').query(requestDto);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      exists: true,
    });
  });
});
