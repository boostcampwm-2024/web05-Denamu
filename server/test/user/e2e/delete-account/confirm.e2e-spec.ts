import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserRepository } from '../../../../src/user/repository/user.repository';
import { RedisService } from '../../../../src/common/redis/redis.service';
import { UserFixture } from '../../../fixture/user.fixture';
import { REDIS_KEYS } from '../../../../src/common/redis/redis.constant';
import { ConfirmDeleteAccountDto } from '../../../../src/user/dto/request/confirmDeleteAccount.dto';
import TestAgent from 'supertest/lib/agent';

describe('POST /api/user/delete-account/confirm E2E Test', () => {
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

  it('[200] 회원 탈퇴 인증 코드가 있을 경우 회원 탈퇴를 성공한다.', async () => {
    // given
    const token = 'test-delete-account-token';
    const requestDto = new ConfirmDeleteAccountDto({ token });
    const userEntity = await UserFixture.createUserCryptFixture();
    const savedUser = await userRepository.save(userEntity);

    const redisKey = `${REDIS_KEYS.USER_DELETE_ACCOUNT_KEY}:${token}`;
    await redisService.set(redisKey, savedUser.id.toString(), 'EX', 600);

    // when
    const response = await agent
      .post('/api/user/delete-account/confirm')
      .send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });

  it('[404] 회원 탈퇴 인증 코드가 잘 못된 경우 회원 탈퇴를 실패한다.', async () => {
    // given
    const requestDto = new ConfirmDeleteAccountDto({ token: 'invalid-token' });

    // when
    const response = await agent
      .post('/api/user/delete-account/confirm')
      .send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[404] 회원 탈퇴 인증 코드가 만료된 경우 회원 탈퇴를 실패한다.', async () => {
    // given
    const token = 'expired-token';
    const redisKey = `${REDIS_KEYS.USER_DELETE_ACCOUNT_KEY}:${token}`;
    const requestDto = new ConfirmDeleteAccountDto({ token });

    // Redis에 저장했다가 삭제하여 만료 상태 시뮬레이션
    await redisService.set(
      redisKey,
      JSON.stringify({ userId: 999, email: 'test@test.com' }),
      'EX',
      1,
    );
    await new Promise((resolve) => setTimeout(resolve, 1100));

    // when
    const response = await agent
      .post('/api/user/delete-account/confirm')
      .send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });
});
