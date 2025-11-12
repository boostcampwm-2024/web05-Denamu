import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserRepository } from '../../../../src/user/repository/user.repository';
import { RedisService } from '../../../../src/common/redis/redis.service';
import { UserFixture } from '../../../fixture/user.fixture';
import { REDIS_KEYS } from '../../../../src/common/redis/redis.constant';
import { ConfirmDeleteAccountDto } from '../../../../src/user/dto/request/confirmDeleteAccount.dto';

describe('POST /api/user/delete-account/confirm', () => {
  let app: INestApplication;
  let redisService: RedisService;
  let userRepository: UserRepository;

  beforeAll(async () => {
    app = global.testApp;
    redisService = app.get(RedisService);
    userRepository = app.get(UserRepository);
  });

  it('회원탈퇴 확정 요청에 성공하고 DB에서 사용자가 삭제된다.', async () => {
    // given
    const token = 'test-delete-account-token';
    const requestDto = new ConfirmDeleteAccountDto({ token });
    const userEntity = await UserFixture.createUserCryptFixture();
    const savedUser = await userRepository.save(userEntity);

    const redisKey = `${REDIS_KEYS.USER_DELETE_ACCOUNT_KEY}:${token}`;
    await redisService.set(redisKey, savedUser.id.toString(), 'EX', 600);

    // when
    const agent = request.agent(app.getHttpServer());
    const response = await agent
      .post('/api/user/delete-account/confirm')
      .send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });

  it('유효하지 않은 토큰으로 회원탈퇴 확정 시 404 에러가 발생한다.', async () => {
    // given
    const requestDto = new ConfirmDeleteAccountDto({ token: 'invalid-token' });

    // when
    const agent = request.agent(app.getHttpServer());
    const response = await agent
      .post('/api/user/delete-account/confirm')
      .send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('만료된 토큰으로 회원탈퇴 확정 시 404 에러가 발생한다.', async () => {
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
    const agent = request.agent(app.getHttpServer());
    const response = await agent
      .post('/api/user/delete-account/confirm')
      .send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });
});
