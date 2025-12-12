import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import { RedisService } from '../../../src/common/redis/redis.service';
import { ResetPasswordRequestDto } from '../../../src/user/dto/request/resetPassword.dto';
import TestAgent from 'supertest/lib/agent';
import * as bcrypt from 'bcrypt';

const URL = '/api/user/password';

describe(`PATCH ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let redisService: RedisService;
  let userRepository: UserRepository;
  const passwordPatchCode = 'user-password-confirm';
  const redisKeyMake = (data: string) =>
    `${REDIS_KEYS.USER_RESET_PASSWORD_KEY}:${data}`;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    redisService = app.get(RedisService);
    userRepository = app.get(UserRepository);
  });

  it('[404] 존재하지 않는 비밀번호 세션 ID를 통해 비밀번호 변경 요청을 할 경우 비밀번호 변경을 실패한다.', async () => {
    // given
    const requestDto = new ResetPasswordRequestDto({
      uuid: `Wrong${passwordPatchCode}`,
      password: 'test1234@',
    });

    // Http when
    const response = await agent.patch(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedPasswordCode = await redisService.get(
      redisKeyMake(passwordPatchCode),
    );

    // DB, Redis then
    expect(savedPasswordCode).toBeNull();
  });

  it('[200] 존재하는 비밀번호 세션 ID를 통해 비밀번호 변경 요청을 할 경우 비밀번호 변경을 성공한다.', async () => {
    // given
    const user = await userRepository.save(UserFixture.createUserFixture());
    const updatedPassword = 'test1234@';
    const requestDto = new ResetPasswordRequestDto({
      uuid: passwordPatchCode,
      password: updatedPassword,
    });
    await redisService.set(
      redisKeyMake(passwordPatchCode),
      JSON.stringify(user.id),
    );

    // Http when
    const response = await agent.patch(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedUser = await userRepository.findOneBy({ id: user.id });
    const savedPasswordCode = await redisService.get(
      redisKeyMake(passwordPatchCode),
    );

    // DB, Redis then
    expect(
      await bcrypt.compare(updatedPassword, savedUser.password),
    ).toBeTruthy();
    expect(savedPasswordCode).toBeNull();
  });
});
