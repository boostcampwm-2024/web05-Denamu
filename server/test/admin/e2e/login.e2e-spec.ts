import { AdminFixture } from './../../fixture/admin.fixture';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { LoginAdminRequestDto } from '../../../src/admin/dto/request/loginAdmin.dto';
import * as supertest from 'supertest';
import { AdminRepository } from '../../../src/admin/repository/admin.repository';
import TestAgent from 'supertest/lib/agent';

describe('POST /api/admin/login E2E Test', () => {
  let app: INestApplication;
  let agent: TestAgent;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const adminRepository = app.get(AdminRepository);
    await adminRepository.insert(await AdminFixture.createAdminCryptFixture());
  });

  it('[200] 등록된 계정이면 정상적으로 로그인할 수 있다.', async () => {
    // given
    const requestDto = new LoginAdminRequestDto({
      loginId: 'test1234',
      password: 'test1234!',
    });

    // when
    const response = await agent.post('/api/admin/login').send(requestDto);

    //then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.headers['set-cookie'][0]).toContain('sessionId=');
  });

  it('[401] 등록되지 않은 ID로 로그인을 시도하면 401 UnAuthorized 예외가 발생한다.', async () => {
    // given
    const requestDto = new LoginAdminRequestDto({
      loginId: 'testWrongAdminId',
      password: 'test1234!',
    });

    // when
    const response = await agent.post('/api/admin/login').send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[401] 비밀번호가 다르다면 401 UnAuthorized 예외가 발생한다.', async () => {
    // given
    const requestDto = new LoginAdminRequestDto({
      loginId: 'test1234',
      password: 'testWrongAdminPassword!',
    });

    // when
    const response = await agent.post('/api/admin/login').send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
});
