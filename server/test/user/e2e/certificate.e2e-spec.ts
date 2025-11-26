import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { RedisService } from '../../../src/common/redis/redis.service';
import { UserFixture } from '../../fixture/user.fixture';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import { CertificateUserRequestDto } from '../../../src/user/dto/request/certificateUser.dto';
import TestAgent from 'supertest/lib/agent';

const URL = '/api/user/certificate';

describe(`POST ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let redisService: RedisService;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    redisService = app.get(RedisService);
  });

  it('[404] 존재하지 않거나 만료된 UUID로 인증을 요청할 경우 회원 가입 인증을 실패한다.', async () => {
    // given
    const requestDto = new CertificateUserRequestDto({
      uuid: 'non-existent-or-expired-uuid',
    });

    // when
    const response = await agent.post(URL).send(requestDto);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[200] 올바른 UUID로 인증을 요청할 경우 회원 가입 인증을 성공한다.', async () => {
    // given
    const uuid = 'test-certificate-uuid';
    const userEntity = UserFixture.createUserFixture();
    const redisKey = `${REDIS_KEYS.USER_AUTH_KEY}:${uuid}`;
    const requestDto = new CertificateUserRequestDto({ uuid });
    await redisService.set(redisKey, JSON.stringify(userEntity));

    // when
    const response = await agent.post(URL).send(requestDto);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();
  });
});
