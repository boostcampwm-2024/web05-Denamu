import {
  ADMIN_DEFAULT_PASSWORD,
  AdminFixture,
} from './../../config/common/fixture/admin.fixture';
import { HttpStatus } from '@nestjs/common';
import { LoginAdminRequestDto } from '../../../src/admin/dto/request/loginAdmin.dto';
import * as uuid from 'uuid';
import { Admin } from '../../../src/admin/entity/admin.entity';
import { AdminE2EHelper } from '../../config/common/helper/admin/admin-helper';

const URL = '/api/admin/login';

describe(`POST ${URL} E2E Test`, () => {
  const { agent, adminRepository, redisService, getRedisKey } =
    new AdminE2EHelper();
  let admin: Admin;
  const sessionKey = 'admin-login-sessionKey';

  beforeEach(async () => {
    jest.spyOn(uuid, 'v4').mockReturnValue(sessionKey as any);
    admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
  });

  afterEach(async () => {
    await Promise.all([
      adminRepository.delete(admin.id),
      redisService.del(getRedisKey(sessionKey)),
    ]);
  });

  it('[401] 등록되지 않은 ID로 로그인할 경우 로그인을 실패한다.', async () => {
    // given
    const requestDto = new LoginAdminRequestDto({
      loginId: 'testWrongAdminId',
      password: ADMIN_DEFAULT_PASSWORD,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedSession = await redisService.get(getRedisKey(sessionKey));

    // DB, Redis then
    expect(savedSession).toBeNull();
  });

  it('[401] 비밀번호가 다를 경우 로그인을 실패한다.', async () => {
    // given
    const requestDto = new LoginAdminRequestDto({
      loginId: admin.loginId,
      password: 'testWrongAdminPassword!',
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedSession = await redisService.get(getRedisKey(sessionKey));

    // DB, Redis then
    expect(savedSession).toBeNull();
  });

  it('[200] 존재하는 사용자의 정보로 로그인할 경우 로그인을 성공한다.', async () => {
    // given
    const requestDto = new LoginAdminRequestDto({
      loginId: admin.loginId,
      password: ADMIN_DEFAULT_PASSWORD,
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.headers['set-cookie'][0]).toContain(sessionKey);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedSession = await redisService.get(getRedisKey(sessionKey));

    // DB, Redis then
    expect(savedSession).toBe(admin.loginId);
  });
});
