import { ConflictException, UnauthorizedException } from '@nestjs/common';

import { Request, Response } from 'express';

import { SESSION_TTL } from '@admin/constant/admin.constant';
import { RegisterAdminRequestDto } from '@admin/dto/request/registerAdmin.dto';
import { AdminRepository } from '@admin/repository/admin.repository';
import { AdminService } from '@admin/service/admin.service';

import { cookieConfig } from '@common/cookie/cookie.config';
import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import {
  ADMIN_DEFAULT_PASSWORD,
  AdminFixture,
} from '@test/config/common/fixture/admin.fixture';

describe(`${AdminService.name} Unit Test`, () => {
  let adminService: AdminService;
  let adminRepository: jest.Mocked<Pick<AdminRepository, 'findOne' | 'save'>>;
  let redisService: jest.Mocked<Pick<RedisService, 'get' | 'set' | 'del'>>;

  const createResponse = () =>
    ({
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    }) as unknown as Response;

  const createRequest = (cookies: Record<string, string> = {}) =>
    ({ cookies }) as unknown as Request;

  beforeEach(() => {
    adminRepository = { findOne: jest.fn(), save: jest.fn() };
    redisService = { get: jest.fn(), set: jest.fn(), del: jest.fn() };

    adminService = new AdminService(
      adminRepository as unknown as AdminRepository,
      redisService as unknown as RedisService,
    );
  });

  describe('loginAdmin', () => {
    const loginDto = {
      loginId: 'admin-id',
      password: ADMIN_DEFAULT_PASSWORD,
    };

    it('존재하지 않는 아이디면 UnauthorizedException을 던진다.', async () => {
      // given
      adminRepository.findOne.mockResolvedValue(null);

      // when & then
      await expect(
        adminService.loginAdmin(loginDto, createResponse(), createRequest()),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('비밀번호가 일치하지 않으면 UnauthorizedException을 던진다.', async () => {
      // given
      const admin = await AdminFixture.createAdminCryptFixture({
        loginId: loginDto.loginId,
      });
      adminRepository.findOne.mockResolvedValue(admin);

      // when & then
      await expect(
        adminService.loginAdmin(
          { ...loginDto, password: 'wrong-password!' },
          createResponse(),
          createRequest(),
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('로그인에 성공하면 세션을 발급하고 쿠키를 설정한다.', async () => {
      // given
      const admin = await AdminFixture.createAdminCryptFixture({
        loginId: loginDto.loginId,
      });
      adminRepository.findOne.mockResolvedValue(admin);
      redisService.get.mockResolvedValue(null);
      const cookie = jest.fn();
      const response = { cookie } as unknown as Response;

      // when
      await adminService.loginAdmin(loginDto, response, createRequest());

      // then
      expect(redisService.set).toHaveBeenCalledTimes(2);
      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining(REDIS_KEYS.ADMIN_AUTH_KEY),
        admin.loginId,
        'EX',
        SESSION_TTL,
      );
      expect(cookie).toHaveBeenCalledWith(
        'sessionId',
        expect.any(String),
        cookieConfig[process.env.NODE_ENV],
      );
    });

    it('기존 세션과 쿠키 세션이 있으면 모두 무효화한다.', async () => {
      // given
      const admin = await AdminFixture.createAdminCryptFixture({
        loginId: loginDto.loginId,
      });
      adminRepository.findOne.mockResolvedValue(admin);
      redisService.get.mockResolvedValue('prev-session-id');

      // when
      await adminService.loginAdmin(
        loginDto,
        createResponse(),
        createRequest({ sessionId: 'cookie-session-id' }),
      );

      // then
      expect(redisService.del).toHaveBeenCalledWith(
        `${REDIS_KEYS.ADMIN_AUTH_KEY}:cookie-session-id`,
        `${REDIS_KEYS.ADMIN_AUTH_KEY}:prev-session-id`,
      );
    });
  });

  describe('logoutAdmin', () => {
    it('세션과 로그인 매핑을 모두 삭제하고 쿠키를 제거한다.', async () => {
      // given
      redisService.get.mockResolvedValue('admin-id');
      const clearCookie = jest.fn();
      const response = { clearCookie } as unknown as Response;

      // when
      await adminService.logoutAdmin(
        createRequest({ sessionId: 'sid-1' }),
        response,
      );

      // then
      expect(redisService.del).toHaveBeenCalledWith(
        `${REDIS_KEYS.ADMIN_AUTH_KEY}:sid-1`,
      );
      expect(redisService.del).toHaveBeenCalledWith(
        `${REDIS_KEYS.ADMIN_SESSION_BY_LOGIN}:admin-id`,
      );
      expect(clearCookie).toHaveBeenCalledWith('sessionId');
    });

    it('세션에 매핑된 로그인 아이디가 없으면 로그인 매핑은 삭제하지 않는다.', async () => {
      // given
      redisService.get.mockResolvedValue(null);

      // when
      await adminService.logoutAdmin(
        createRequest({ sessionId: 'sid-1' }),
        createResponse(),
      );

      // then
      expect(redisService.del).toHaveBeenCalledTimes(1);
    });
  });

  describe('createAdmin', () => {
    const registerDto = new RegisterAdminRequestDto({
      loginId: 'new-admin',
      password: ADMIN_DEFAULT_PASSWORD,
    });

    it('이미 존재하는 아이디면 ConflictException을 던진다.', async () => {
      // given
      adminRepository.findOne.mockResolvedValue(
        await AdminFixture.createAdminCryptFixture(),
      );

      // when & then
      await expect(adminService.createAdmin(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(adminRepository.save).not.toHaveBeenCalled();
    });

    it('비밀번호를 해시한 뒤 저장한다.', async () => {
      // given
      adminRepository.findOne.mockResolvedValue(null);

      // when
      await adminService.createAdmin(registerDto);

      // then
      const saved = adminRepository.save.mock.calls[0][0] as { password: string };
      expect(adminRepository.save).toHaveBeenCalledTimes(1);
      expect(saved.password).not.toBe(ADMIN_DEFAULT_PASSWORD);
    });
  });
});
