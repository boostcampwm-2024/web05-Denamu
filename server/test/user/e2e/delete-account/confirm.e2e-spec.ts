import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserRepository } from '../../../../src/user/repository/user.repository';
import { RedisService } from '../../../../src/common/redis/redis.service';
import { UserFixture } from '../../../fixture/user.fixture';
import { REDIS_KEYS } from '../../../../src/common/redis/redis.constant';
import { ConfirmDeleteAccountDto } from '../../../../src/user/dto/request/confirmDeleteAccount.dto';
import TestAgent from 'supertest/lib/agent';

const URL = '/api/user/delete-account/confirm';

describe(`POST ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let redisService: RedisService;
  let userRepository: UserRepository;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    redisService = app.get(RedisService);
    userRepository = app.get(UserRepository);
  });

  it('[404] 회원 탈퇴 인증 코드가 만료되었거나 잘 못된 경우 회원 탈퇴를 실패한다.', async () => {
    // given
    const requestDto = new ConfirmDeleteAccountDto({ token: 'invalid-token' });

    // when
    const response = await agent.post(URL).send(requestDto);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[200] 회원 탈퇴 인증 코드가 있을 경우 회원 탈퇴를 성공한다.', async () => {
    // given
    const token = 'test-delete-account-token';
    const requestDto = new ConfirmDeleteAccountDto({ token });
    const user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );

    await redisService.set(
      `${REDIS_KEYS.USER_DELETE_ACCOUNT_KEY}:${token}`,
      user.id.toString(),
      'EX',
      600,
    );

    // when
    const response = await agent.post(URL).send(requestDto);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();
  });
});
