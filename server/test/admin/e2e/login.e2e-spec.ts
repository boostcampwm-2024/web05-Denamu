import { AdminFixture } from './../../config/fixture/admin.fixture';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { LoginAdminRequestDto } from '../../../src/admin/dto/request/loginAdmin.dto';
import * as supertest from 'supertest';
import { AdminRepository } from '../../../src/admin/repository/admin.repository';
import TestAgent from 'supertest/lib/agent';
import { RedisService } from '../../../src/common/redis/redis.service';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import * as uuid from 'uuid';

const URL = '/api/admin/login';

describe(`POST ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let redisService: RedisService;
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;
  const sessionKey = 'admin-login-sessionKey';

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    redisService = app.get(RedisService);
    const adminRepository = app.get(AdminRepository);
    await adminRepository.insert(await AdminFixture.createAdminCryptFixture());
  });

  beforeEach(() => {
    jest.spyOn(uuid, 'v4').mockReturnValue(sessionKey as any);
  });

  it('[401] 등록되지 않은 ID로 로그인할 경우 로그인을 실패한다.', async () => {
    // given
    const requestDto = new LoginAdminRequestDto({
      loginId: 'testWrongAdminId',
      password: AdminFixture.GENERAL_ADMIN.password,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedSession = await redisService.get(redisKeyMake(sessionKey));

    // DB, Redis then
    expect(savedSession).toBeNull();
  });

  it('[401] 비밀번호가 다를 경우 로그인을 실패한다.', async () => {
    // given
    const requestDto = new LoginAdminRequestDto({
      loginId: AdminFixture.GENERAL_ADMIN.loginId,
      password: 'testWrongAdminPassword!',
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedSession = await redisService.get(redisKeyMake(sessionKey));

    // DB, Redis then
    expect(savedSession).toBeNull();
  });

  it('[200] 존재하는 사용자의 정보로 로그인할 경우 로그인을 성공한다.', async () => {
    // given
    const requestDto = new LoginAdminRequestDto({
      loginId: AdminFixture.GENERAL_ADMIN.loginId,
      password: AdminFixture.GENERAL_ADMIN.password,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.headers['set-cookie'][0]).toContain(sessionKey);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedSession = await redisService.get(redisKeyMake(sessionKey));

    // DB, Redis then
    expect(savedSession).toBe(AdminFixture.GENERAL_ADMIN.loginId);
  });
});
