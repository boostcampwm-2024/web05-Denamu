import { AdminFixture } from './../../fixture/admin.fixture';
import { INestApplication } from '@nestjs/common';
import { LoginAdminRequestDto } from '../../../src/admin/dto/request/login-admin.dto';
import * as request from 'supertest';
import { AdminRepository } from '../../../src/admin/repository/admin.repository';
describe('POST api/admin/login E2E Test', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = global.testApp;
    const adminRepository = app.get(AdminRepository);
    await adminRepository.insert(await AdminFixture.createAdminCryptFixture());
  });

  it('등록된 계정이면 정상적으로 로그인할 수 있다.', async () => {
    //given
    const loginAdminDto = new LoginAdminRequestDto({
      loginId: 'test1234',
      password: 'test1234!',
    });

    //when
    const response = await request(app.getHttpServer())
      .post('/api/admin/login')
      .send(loginAdminDto);

    //then
    expect(response.status).toBe(200);
    expect(response.headers['set-cookie'][0]).toContain('sessionId=');
  });

  it('등록되지 않은 ID로 로그인을 시도하면 401 UnAuthorized 예외가 발생한다.', async () => {
    //given
    const loginWrongAdminIdDto = new LoginAdminRequestDto({
      loginId: 'testWrongAdminId',
      password: 'test1234!',
    });

    //when
    const response = await request(app.getHttpServer())
      .post('/api/admin/login')
      .send(loginWrongAdminIdDto);

    //then
    expect(response.status).toBe(401);
  });

  it('비밀번호가 다르다면 401 UnAuthorized 예외가 발생한다.', async () => {
    //given
    const loginWrongAdminPasswordDto = new LoginAdminRequestDto({
      loginId: 'test1234',
      password: 'testWrongAdminPassword!',
    });

    //when
    const response = await request(app.getHttpServer())
      .post('/api/admin/login')
      .send(loginWrongAdminPasswordDto);

    //then
    expect(response.status).toBe(401);
  });
});
