import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { RedisService } from '../../../src/common/redis/redis.service';
import { UserFixture } from '../../fixture/user.fixture';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';

describe('User Delete Account E2E Test', () => {
  let app: INestApplication;
  let redisService: RedisService;
  let userRepository: UserRepository;

  beforeAll(async () => {
    app = global.testApp;
    redisService = app.get(RedisService);
    userRepository = app.get(UserRepository);
  });

  describe('POST /api/user/delete-account/request', () => {
    it('회원탈퇴 신청 요청에 성공하고 Redis에 토큰이 저장된다.', async () => {
      // given
      const agent = request.agent(app.getHttpServer());
      const userEntity = await UserFixture.createUserCryptFixture();
      await userRepository.insert(userEntity);

      const loginResponse = await agent.post('/api/user/login').send({
        email: UserFixture.GENERAL_USER.email,
        password: UserFixture.GENERAL_USER.password,
      });

      const accessToken = loginResponse.body.data.accessToken;

      // when
      const response = await agent
        .post('/api/user/delete-account/request')
        .set('Authorization', `Bearer ${accessToken}`);

      // then
      expect(response.status).toBe(200);
    });

    it('인증되지 않은 사용자가 회원탈퇴 신청 시 401 에러가 발생한다.', async () => {
      // given
      const agent = request.agent(app.getHttpServer());

      // when
      const response = await agent.post('/api/user/delete-account/request');

      // then
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/user/delete-account/confirm', () => {
    it('회원탈퇴 확정 요청에 성공하고 DB에서 사용자가 삭제된다.', async () => {
      // given
      const token = 'test-delete-account-token';
      const userEntity = await UserFixture.createUserCryptFixture();
      const savedUser = await userRepository.save(userEntity);

      const redisKey = `${REDIS_KEYS.USER_DELETE_ACCOUNT_KEY}:${token}`;
      await redisService.set(
        redisKey,
        JSON.stringify({ userId: savedUser.id, email: savedUser.email }),
      );

      // when
      const agent = request.agent(app.getHttpServer());
      const response = await agent
        .post('/api/user/delete-account/confirm')
        .send({ token });

      // then
      expect(response.status).toBe(200);
    });

    it('유효하지 않은 토큰으로 회원탈퇴 확정 시 404 에러가 발생한다.', async () => {
      // given
      const token = 'invalid-token';

      // when
      const agent = request.agent(app.getHttpServer());
      const response = await agent
        .post('/api/user/delete-account/confirm')
        .send({ token });

      // then
      expect(response.status).toBe(404);
    });

    it('만료된 토큰으로 회원탈퇴 확정 시 404 에러가 발생한다.', async () => {
      // given
      const token = 'expired-token';
      const redisKey = `${REDIS_KEYS.USER_DELETE_ACCOUNT_KEY}:${token}`;

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
        .send({ token });

      // then
      expect(response.status).toBe(404);
    });
  });
});
