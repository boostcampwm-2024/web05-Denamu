import { HttpStatus, INestApplication } from '@nestjs/common';
import { RegisterAdminRequestDto } from '../../../src/admin/dto/request/registerAdmin.dto';
import * as supertest from 'supertest';
import { AdminFixture } from '../../fixture/admin.fixture';
import { AdminRepository } from '../../../src/admin/repository/admin.repository';
import TestAgent from 'supertest/lib/agent';
import { RedisService } from '../../../src/common/redis/redis.service';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';

const URL = '/api/admin/register';

describe(`POST ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let adminRepository: AdminRepository;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    adminRepository = app.get(AdminRepository);
    const redisService = app.get(RedisService);
    await adminRepository.insert(await AdminFixture.createAdminCryptFixture());
    await redisService.set(
      `${REDIS_KEYS.ADMIN_AUTH_KEY}:testSessionId`,
      'test1234',
    );
  });

  it('[401] 관리자가 로그인 상태가 아닐 경우 회원가입을 실패한다.', async () => {
    // given
    const newAdminDto = new RegisterAdminRequestDto({
      loginId: 'testNewAdminId',
      password: 'testNewAdminPassword!',
    });

    // when
    const response = await agent.post(URL).send(newAdminDto);

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[409] 중복된 ID로 회원가입을 할 경우 다른 관리자 계정 회원가입을 실패한다.', async () => {
    // given
    const newAdminDto = new RegisterAdminRequestDto(AdminFixture.GENERAL_ADMIN);

    // when
    const response = await agent
      .post(URL)
      .send(newAdminDto)
      .set('Cookie', 'sessionId=testSessionId');

    //then
    expect(response.status).toBe(HttpStatus.CONFLICT);
  });

  it('[201] 관리자 로그인이 되어 있을 경우 다른 관리자 계정 회원가입을 성공한다.', async () => {
    // given
    const newAdminDto = new RegisterAdminRequestDto({
      loginId: 'testNewAdminId',
      password: 'testNewAdminPassword!',
    });

    // when
    const response = await agent
      .post(URL)
      .send(newAdminDto)
      .set('Cookie', 'sessionId=testSessionId');

    // then
    expect(response.status).toBe(HttpStatus.CREATED);

    // cleanup
    await adminRepository.delete({ loginId: newAdminDto.loginId });
  });
});
