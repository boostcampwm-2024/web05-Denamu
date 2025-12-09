import { HttpStatus, INestApplication } from '@nestjs/common';
import { RegisterAdminRequestDto } from '../../../src/admin/dto/request/registerAdmin.dto';
import * as supertest from 'supertest';
import { AdminFixture } from '../../fixture/admin.fixture';
import { AdminRepository } from '../../../src/admin/repository/admin.repository';
import TestAgent from 'supertest/lib/agent';
import { RedisService } from '../../../src/common/redis/redis.service';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import * as bcrypt from 'bcrypt';

const URL = '/api/admin/register';

describe(`POST ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let adminRepository: AdminRepository;
  const sessionId = 'testSessionId';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    adminRepository = app.get(AdminRepository);
    const redisService = app.get(RedisService);
    await Promise.all([
      adminRepository.insert(await AdminFixture.createAdminCryptFixture()),
      redisService.set(redisKeyMake(sessionId), 'test1234'),
    ]);
  });

  it('[401] 관리자 로그인 쿠키가 없을 경우 회원가입을 실패한다.', async () => {
    // given
    const newAdminDto = new RegisterAdminRequestDto({
      loginId: 'testNewAdminId',
      password: 'testNewAdminPassword!',
    });

    // Http when
    const response = await agent.post(URL).send(newAdminDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedAdmin = await adminRepository.findOneBy({
      loginId: newAdminDto.loginId,
    });

    // DB, Redis then
    expect(savedAdmin).toBeNull();
  });

  it('[401] 관리자 로그인 쿠키가 만료됐을 경우 회원가입을 실패한다.', async () => {
    // given
    const newAdminDto = new RegisterAdminRequestDto({
      loginId: 'testNewAdminId',
      password: 'testNewAdminPassword!',
    });

    // Http when
    const response = await agent
      .post(URL)
      .send(newAdminDto)
      .set('Cookie', `sessionId=Wrong${sessionId}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedAdmin = await adminRepository.findOneBy({
      loginId: newAdminDto.loginId,
    });

    // DB, Redis then
    expect(savedAdmin).toBeNull();
  });

  it('[409] 중복된 ID로 회원가입을 할 경우 다른 관리자 계정 회원가입을 실패한다.', async () => {
    // given
    const newAdminDto = new RegisterAdminRequestDto({
      loginId: AdminFixture.GENERAL_ADMIN.loginId,
      password: AdminFixture.GENERAL_ADMIN.password,
    });

    // Http when
    const response = await agent
      .post(URL)
      .send(newAdminDto)
      .set('Cookie', `sessionId=${sessionId}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CONFLICT);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedAdmin = await adminRepository.findBy({
      loginId: newAdminDto.loginId,
    });

    // DB, Redis then
    expect(savedAdmin.length).toBe(1);
  });

  it('[201] 관리자 로그인이 되어 있을 경우 다른 관리자 계정 회원가입을 성공한다.', async () => {
    // given
    const newAdminDto = new RegisterAdminRequestDto({
      loginId: 'testNewAdminId',
      password: 'testNewAdminPassword!',
    });

    // Http when
    const response = await agent
      .post(URL)
      .send(newAdminDto)
      .set('Cookie', `sessionId=${sessionId}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedAdmin = await adminRepository.findOneBy({
      loginId: 'testNewAdminId',
    });

    // DB, Redis then
    expect(savedAdmin).not.toBeNull();
    expect(
      await bcrypt.compare(newAdminDto.password, savedAdmin.password),
    ).toBeTruthy();

    // cleanup
    await adminRepository.delete({ loginId: newAdminDto.loginId });
  });
});
