import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import { RedisService } from '../../../src/common/redis/redis.service';
import * as bcrypt from 'bcrypt';

describe('PATCH api/user/password E2E Test', () => {
  let app: INestApplication;
  let redisService: RedisService;
  let userRepository: UserRepository;

  beforeAll(async () => {
    app = global.testApp;
    redisService = app.get(RedisService);
    userRepository = app.get(UserRepository);
  });

  it('비밀번호 변경 요청에 성공하면 DB의 사용자 비밀번호를 갱신한다.', async () => {
    // given
    const uuid = 'test-reset-password-uuid';
    const redisKey = `${REDIS_KEYS.USER_RESET_PASSWORD_KEY}:${uuid}`;
    const userEntity = UserFixture.createUserFixture();
    const savedUser = await userRepository.save(userEntity);
    await redisService.set(redisKey, JSON.stringify(savedUser.id));
    const updatedPassword = 'test1234@';

    // when
    const agent = request.agent(app.getHttpServer());
    const response = await agent
      .patch('/api/user/password')
      .send({ uuid, password: updatedPassword });

    // then
    expect(response.status).toBe(200);
    const updatedUser = await userRepository.findOne({
      where: { email: userEntity.email },
    });
    expect(updatedUser).toBeDefined();
    expect(await bcrypt.compare(updatedPassword, updatedUser.password)).toBe(
      true,
    );
    expect(
      await bcrypt.compare(userEntity.password, updatedUser.password),
    ).toBe(false);
  });

  it('없거나 만료된 uuid 토큰으로 요청하면 404 NotFoundException를 반환한다.', async () => {
    // given
    const uuid = 'non-existent-or-expired-uuid';
    const password = 'test1234@';

    // when
    const agent = request.agent(app.getHttpServer());
    const response = await agent
      .patch('/api/user/password')
      .send({ uuid, password });

    // then
    expect(response.status).toBe(404);
  });
});
