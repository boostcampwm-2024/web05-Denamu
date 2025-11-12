import { HttpStatus, INestApplication } from '@nestjs/common';
import { LoginAdminRequestDto } from '../../../src/admin/dto/request/loginAdmin.dto';
import { RegisterAdminRequestDto } from '../../../src/admin/dto/request/registerAdmin.dto';
import * as supertest from 'supertest';
import { AdminFixture } from '../../fixture/admin.fixture';
import { AdminRepository } from '../../../src/admin/repository/admin.repository';
import TestAgent from 'supertest/lib/agent';

describe('POST /api/admin/register E2E Test', () => {
  let app: INestApplication;
  let agent: TestAgent;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const adminRepository = app.get(AdminRepository);
    await adminRepository.insert(await AdminFixture.createAdminCryptFixture());
  });

  it('[201] 관리자가 로그인되어 있으면 다른 관리자 계정 회원가입을 할 수 있다.', async () => {
    // given
    const loginAdminDto = new LoginAdminRequestDto({
      loginId: 'test1234',
      password: 'test1234!',
    });
    const newAdminDto = new RegisterAdminRequestDto({
      loginId: 'testNewAdminId',
      password: 'testNewAdminPassword!',
    });

    // when
    await agent.post('/api/admin/login').send(loginAdminDto);
    const response = await agent.post('/api/admin/register').send(newAdminDto);

    // then
    expect(response.status).toBe(HttpStatus.CREATED);
  });

  it('[409] 이미 가입한 ID를 입력하면 관리자 계정을 생성할 수 없다.', async () => {
    // given
    const loginAdminDto = new LoginAdminRequestDto({
      loginId: 'test1234',
      password: 'test1234!',
    });
    const newAdminDto = new RegisterAdminRequestDto({
      loginId: 'testNewAdminId',
      password: 'testNewAdminPassword!',
    });

    // when
    await agent.post('/api/admin/login').send(loginAdminDto);
    const response = await agent.post('/api/admin/register').send(newAdminDto);

    //then
    expect(response.status).toBe(HttpStatus.CONFLICT);
  });

  it('[401] 관리자가 로그아웃 상태면 예외가 발생한다.', async () => {
    // given
    const newAdminDto = new RegisterAdminRequestDto({
      loginId: 'testNewAdminId',
      password: 'testNewAdminPassword!',
    });

    // when
    const response = await agent.post('/api/admin/register').send(newAdminDto);

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
});
