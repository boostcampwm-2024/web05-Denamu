import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { LoginAdminRequestDto } from '../../../src/admin/dto/request/login-admin.dto';
import { AdminRepository } from '../../../src/admin/repository/admin.repository';
import { AdminFixture } from '../../fixture/admin.fixture';

describe('GET api/admin/sessionId E2E Test', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = global.testApp;
    const adminRepository = app.get(AdminRepository);
    await adminRepository.insert(await AdminFixture.createAdminCryptFixture());
  });

  it('쿠키의 session id가 유효하다면 관리자를 로그인 상태로 취급한다.', async () => {
    //given
    const agent = request.agent(app.getHttpServer());
    const loginAdminDto = new LoginAdminRequestDto({
      loginId: 'test1234',
      password: 'test1234!',
    });

    //when
    await agent.post('/api/admin/login').send(loginAdminDto);
    const response = await agent.get('/api/admin/sessionId');

    //then
    expect(response.status).toBe(200);
  });

  it('session id가 일치하지 않는다면 401 UnAuthorized 예외가 발생한다.', async () => {
    //given
    const randomUUID = uuidv4();

    //when
    const response = await request(app.getHttpServer())
      .get('/api/admin/sessionId')
      .set('Cookie', [`sessionId=${randomUUID}`]);

    //then
    expect(response.status).toBe(401);
  });

  it('session id가 없다면 401 UnAuthorized 예외가 발생한다.', async () => {
    //when
    const response = await request(app.getHttpServer())
      .get('/api/admin/sessionId')
      .set('Cookie', [`sessionId=`]);

    //then
    expect(response.status).toBe(401);
  });
});
