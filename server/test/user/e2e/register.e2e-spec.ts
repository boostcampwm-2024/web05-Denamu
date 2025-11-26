import { HttpStatus, INestApplication } from '@nestjs/common';
import { RegisterUserRequestDto } from '../../../src/user/dto/request/registerUser.dto';
import * as supertest from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import TestAgent from 'supertest/lib/agent';

const URL = '/api/user/register';

describe(`POST ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let userRepository: UserRepository;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    userRepository = app.get(UserRepository);
  });

  it('[409] 이미 가입된 이메일을 입력할 경우 회원가입을 실패한다.', async () => {
    // given
    const userRepository = app.get(UserRepository);
    const user = await userRepository.save(UserFixture.createUserFixture());
    const requestDto = new RegisterUserRequestDto({
      email: user.email,
      password: user.password,
      userName: user.userName,
    });

    // when
    const response = await agent.post(URL).send(requestDto);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CONFLICT);
    expect(data).toBeUndefined();

    // cleanup
    await userRepository.delete(user.id);
  });

  it('[201] 중복되는 회원이 없을 경우 회원가입을 성공한다.', async () => {
    // given
    const requestDto = new RegisterUserRequestDto({
      email: 'test1234@test.com',
      password: 'test1234!',
      userName: 'test1234',
    });

    // when
    const response = await agent.post(URL).send(requestDto);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(data).toBeUndefined();

    // cleanup
    await userRepository.delete({ email: requestDto.email });
  });
});
