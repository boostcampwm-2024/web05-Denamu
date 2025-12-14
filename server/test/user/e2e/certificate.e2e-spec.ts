import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { RedisService } from '../../../src/common/redis/redis.service';
import { UserFixture } from '../../config/fixture/user.fixture';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import { CertificateUserRequestDto } from '../../../src/user/dto/request/certificateUser.dto';
import TestAgent from 'supertest/lib/agent';
import { UserRepository } from '../../../src/user/repository/user.repository';
import * as bcrypt from 'bcrypt';

const URL = '/api/user/certificate';

describe(`POST ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let redisService: RedisService;
  let userRepository: UserRepository;
  const userRegisterCode = 'user-register-certificate';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.USER_AUTH_KEY}:${data}`;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    redisService = app.get(RedisService);
    userRepository = app.get(UserRepository);
  });

  it('[404] 존재하지 않거나 만료된 UUID로 인증을 요청할 경우 회원 가입 인증을 실패한다.', async () => {
    // given
    const requestDto = new CertificateUserRequestDto({
      uuid: `Wrong${userRegisterCode}`,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[200] 올바른 인증 코드로 인증을 요청할 경우 회원 가입 인증을 성공한다.', async () => {
    // given
    const userEntity = await UserFixture.createUserCryptFixture();
    const requestDto = new CertificateUserRequestDto({
      uuid: userRegisterCode,
    });
    await redisService.set(
      redisKeyMake(userRegisterCode),
      JSON.stringify(userEntity),
    );

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedUser = await userRepository.findOneBy({
      email: userEntity.email,
      userName: userEntity.userName,
    });
    const savedRegisterCode = await redisService.get(
      redisKeyMake(userRegisterCode),
    );

    // DB, Redis then
    expect(savedRegisterCode).toBeNull();
    expect(savedUser).not.toBeNull();
    expect(
      await bcrypt.compare(
        UserFixture.GENERAL_USER.password,
        savedUser.password,
      ),
    ).toBeTruthy();
  });
});
