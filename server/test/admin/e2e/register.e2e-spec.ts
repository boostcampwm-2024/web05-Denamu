import { INestApplication } from '@nestjs/common';
import { LoginAdminRequestDto } from '../../../src/admin/dto/request/login-admin.dto';
import { RegisterAdminRequestDto } from '../../../src/admin/dto/request/register-admin.dto';
import * as request from 'supertest';
import { AdminFixture } from '../../fixture/admin.fixture';
import { AdminRepository } from '../../../src/admin/repository/admin.repository';

describe('POST api/admin/register E2E Test', () => {
  let app: INestApplication;

  const loginAdminDto = new LoginAdminRequestDto({
    loginId: 'test1234',
    password: 'test1234!',
  });

  const newAdminDto = new RegisterAdminRequestDto({
    loginId: 'testNewAdminId',
    password: 'testNewAdminPassword!',
  });

  beforeAll(async () => {
    app = global.testApp;
    const adminRepository = app.get(AdminRepository);
    await adminRepository.insert(await AdminFixture.createAdminCryptFixture());
  });

  it('관리자가 로그인되어 있으면 다른 관리자 계정 회원가입을 할 수 있다.', async () => {
    //given
    const agent = request.agent(app.getHttpServer());

    //when
    await agent.post('/api/admin/login').send(loginAdminDto);
    const response = await agent.post('/api/admin/register').send(newAdminDto);

    //then
    expect(response.status).toBe(201);
  });

  it('이미 가입한 ID를 입력하면 관리자 계정을 생성할 수 없다.', async () => {
    //given
    const agent = request.agent(app.getHttpServer());

    //when
    await agent.post('/api/admin/login').send(loginAdminDto);
    const response = await agent.post('/api/admin/register').send(newAdminDto);

    //then
    expect(response.status).toBe(409);
  });

  it('관리자가 로그아웃 상태면 401 UnAuthorized 예외가 발생한다.', async () => {
    const agent = request.agent(app.getHttpServer());

    //when
    const response = await agent.post('/api/admin/register').send(newAdminDto);

    //then
    expect(response.status).toBe(401);
  });
});
