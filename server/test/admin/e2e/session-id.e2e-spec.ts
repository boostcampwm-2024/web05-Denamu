import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { LoginAdminRequestDto } from '../../../src/admin/dto/request/loginAdmin.dto';
import { AdminRepository } from '../../../src/admin/repository/admin.repository';
import { AdminFixture } from '../../fixture/admin.fixture';
import TestAgent from 'supertest/lib/agent';

describe('GET /api/admin/sessionId E2E Test', () => {
  let app: INestApplication;
  let agent: TestAgent;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const adminRepository = app.get(AdminRepository);
    await adminRepository.insert(await AdminFixture.createAdminCryptFixture());
  });

  it('[200] 쿠키의 session id가 유효하다면 관리자를 로그인 상태로 취급한다.', async () => {
    // given
    const agent = supertest.agent(app.getHttpServer());
    const requestDto = new LoginAdminRequestDto({
      loginId: 'test1234',
      password: 'test1234!',
    });

    // when
    await agent.post('/api/admin/login').send(requestDto);
    const response = await agent.get('/api/admin/sessionId');

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });

  it('[401] session id가 서버에 존재하지 않는다면 401 UnAuthorized 예외가 발생한다.', async () => {
    // given
    const randomUUID = uuidv4();

    // when
    const response = await agent
      .get('/api/admin/sessionId')
      .set('Cookie', [`sessionId=${randomUUID}`]);

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[401] session id가 클라이언트에 존재하지 않는다면 401 UnAuthorized 예외가 발생한다.', async () => {
    // when
    const response = await agent
      .get('/api/admin/sessionId')
      .set('Cookie', [`sessionId=`]);

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
});
