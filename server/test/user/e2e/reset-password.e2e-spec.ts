import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import { RedisService } from '../../../src/common/redis/redis.service';
import * as bcrypt from 'bcrypt';
import { ResetPasswordRequestDto } from '../../../src/user/dto/request/resetPassword.dto';
import TestAgent from 'supertest/lib/agent';

describe('PATCH /api/user/password E2E Test', () => {
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

  it('[200] 존재하는 비밀번호 세션 ID를 통해 비밀번호 변경 요청을 할 경우 비밀번호 변경을 성공한다.', async () => {
    // given
    const uuid = 'test-reset-password-uuid';
    const redisKey = `${REDIS_KEYS.USER_RESET_PASSWORD_KEY}:${uuid}`;
    const userEntity = UserFixture.createUserFixture();
    const savedUser = await userRepository.save(userEntity);
    const updatedPassword = 'test1234@';
    const requestDto = new ResetPasswordRequestDto({
      uuid,
      password: updatedPassword,
    });
    await redisService.set(redisKey, JSON.stringify(savedUser.id));

    // when
    const response = await agent.patch('/api/user/password').send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.OK);
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

  it('[404] 존재하지 않는 비밀번호 세션 ID를 통해 비밀번호 변경 요청을 할 경우 비밀번호 변경을 실패한다.', async () => {
    // given
    const requestDto = new ResetPasswordRequestDto({
      uuid: 'non-existent-or-expired-uuid',
      password: 'test1234@',
    });

    // when
    const response = await agent.patch('/api/user/password').send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });
});
