import { HttpStatus } from '@nestjs/common';
import { RegisterAdminRequestDto } from '../../../src/admin/dto/request/registerAdmin.dto';
import { AdminFixture } from '../../config/common/fixture/admin.fixture';
import * as bcrypt from 'bcrypt';
import { AdminE2EHelper } from '../../config/common/helper/admin/admin-helper';

const URL = '/api/admin/register';

describe(`POST ${URL} E2E Test`, () => {
  const { agent, adminRepository, redisService, getRedisKey } =
    new AdminE2EHelper();
  const sessionKey = 'admin-register-session-key';

  beforeEach(async () => {
    await redisService.set(getRedisKey(sessionKey), 'testAdminId');
  });

  afterEach(async () => {
    await redisService.del(getRedisKey(sessionKey));
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
      .set('Cookie', `sessionId=Wrong${sessionKey}`);

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
    const admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    const newAdminDto = new RegisterAdminRequestDto({
      loginId: admin.loginId,
      password: 'testNewAdminPassword!',
    });

    // Http when
    const response = await agent
      .post(URL)
      .send(newAdminDto)
      .set('Cookie', `sessionId=${sessionKey}`);

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

    // cleanup
    await adminRepository.delete(admin.id);
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
      .set('Cookie', `sessionId=${sessionKey}`);

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
    await adminRepository.delete(savedAdmin.id);
  });
});
