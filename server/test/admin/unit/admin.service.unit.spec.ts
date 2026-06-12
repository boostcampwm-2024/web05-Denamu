import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { Request, Response } from 'express';

import { SESSION_TTL } from '@admin/constant/admin.constant';
import { RegisterAdminRequestDto } from '@admin/dto/request/registerAdmin.dto';
import { AdminRepository } from '@admin/repository/admin.repository';
import { AdminService } from '@admin/service/admin.service';

import { cookieConfig } from '@common/cookie/cookie.config';
import { EmailProducer } from '@common/email/email.producer';
import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import {
  ADMIN_DEFAULT_PASSWORD,
  AdminFixture,
} from '@test/config/common/fixture/admin.fixture';

describe(`${AdminService.name} Unit Test`, () => {
  let adminService: AdminService;
  let adminRepository: jest.Mocked<
    Pick<AdminRepository, 'findOne' | 'save' | 'find' | 'delete'>
  >;
  let redisService: jest.Mocked<
    Pick<RedisService, 'get' | 'set' | 'del' | 'setex'>
  >;
  let emailProducer: jest.Mocked<
    Pick<EmailProducer, 'produceAdminCertification'>
  >;

  const createResponse = () =>
    ({
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    }) as unknown as Response;

  const createRequest = (cookies: Record<string, string> = {}) =>
    ({ cookies }) as unknown as Request;

  beforeEach(() => {
    adminRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    };
    redisService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      setex: jest.fn(),
    };
    emailProducer = {
      produceAdminCertification: jest.fn(),
    };

    adminService = new AdminService(
      adminRepository as unknown as AdminRepository,
      redisService as unknown as RedisService,
      emailProducer as unknown as EmailProducer,
    );
  });

  describe('loginAdmin', () => {
    const loginDto = {
      email: 'admin@test.com',
      password: ADMIN_DEFAULT_PASSWORD,
    };

    it('존재하지 않는 이메일이면 UnauthorizedException을 던진다.', async () => {
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
        email: loginDto.email,
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
        email: loginDto.email,
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
        admin.email,
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
        email: loginDto.email,
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
    it('세션과 이메일 매핑을 모두 삭제하고 쿠키를 제거한다.', async () => {
      // given
      redisService.get.mockResolvedValue('admin@test.com');
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
        `${REDIS_KEYS.ADMIN_SESSION_BY_EMAIL}:admin@test.com`,
      );
      expect(clearCookie).toHaveBeenCalledWith('sessionId');
    });

    it('세션에 매핑된 이메일이 없으면 이메일 매핑은 삭제하지 않는다.', async () => {
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

  describe('registerAdmin', () => {
    const registerDto = new RegisterAdminRequestDto({
      password: ADMIN_DEFAULT_PASSWORD,
      name: 'new-admin-name',
      email: 'new-admin@test.com',
    });
    const parentEmail = 'parent-admin@test.com';

    it('이미 존재하는 이메일이면 ConflictException을 던진다.', async () => {
      // given
      adminRepository.findOne.mockResolvedValue(
        await AdminFixture.createAdminCryptFixture(),
      );

      // when & then
      await expect(
        adminService.registerAdmin(registerDto, parentEmail),
      ).rejects.toThrow(ConflictException);
      expect(redisService.set).not.toHaveBeenCalled();
      expect(emailProducer.produceAdminCertification).not.toHaveBeenCalled();
    });

    it('비밀번호를 해시해 부모와 함께 Redis에 저장하고 인증 메일을 발행한다.', async () => {
      // given
      const parent = await AdminFixture.createAdminCryptFixture({
        email: parentEmail,
      });
      parent.id = 7;
      adminRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(parent);

      // when
      await adminService.registerAdmin(registerDto, parentEmail);

      // then
      expect(adminRepository.save).not.toHaveBeenCalled();
      expect(redisService.set).toHaveBeenCalledTimes(1);

      const [redisKey, serializedAdmin] = redisService.set.mock.calls[0];
      expect(redisKey).toContain(REDIS_KEYS.ADMIN_REGISTER_KEY);
      const storedAdmin = JSON.parse(serializedAdmin as string) as {
        password: string;
        parentAdminId: number | null;
        email: string;
      };
      expect(storedAdmin.password).not.toBe(ADMIN_DEFAULT_PASSWORD);
      expect(storedAdmin.parentAdminId).toBe(7);
      expect(storedAdmin.email).toBe(registerDto.email);

      expect(emailProducer.produceAdminCertification).toHaveBeenCalledWith(
        registerDto.email,
        registerDto.name,
        expect.any(String),
      );
    });
  });

  describe('certificateAdmin', () => {
    it('존재하지 않거나 만료된 코드면 NotFoundException을 던진다.', async () => {
      // given
      redisService.get.mockResolvedValue(null);

      // when & then
      await expect(adminService.certificateAdmin('wrong-code')).rejects.toThrow(
        NotFoundException,
      );
      expect(adminRepository.save).not.toHaveBeenCalled();
    });

    it('유효한 코드면 Redis 값을 삭제하고 관리자를 저장한다.', async () => {
      // given
      const pendingAdmin = await AdminFixture.createAdminCryptFixture({
        email: 'verified-admin@test.com',
      });
      redisService.get.mockResolvedValue(JSON.stringify(pendingAdmin));

      // when
      await adminService.certificateAdmin('valid-code');

      // then
      expect(redisService.del).toHaveBeenCalledWith(
        `${REDIS_KEYS.ADMIN_REGISTER_KEY}:valid-code`,
      );
      expect(adminRepository.save).toHaveBeenCalledTimes(1);
      const saved = adminRepository.save.mock.calls[0][0] as {
        email: string;
      };
      expect(saved.email).toBe('verified-admin@test.com');
    });
  });

  describe('getChildAdmins', () => {
    it('생성자의 ID를 부모로 가지는 관리자 목록을 반환한다.', async () => {
      // given
      const parent = await AdminFixture.createAdminCryptFixture({
        email: 'parent-admin@test.com',
      });
      parent.id = 7;
      const child = await AdminFixture.createAdminCryptFixture({
        email: 'child-admin@test.com',
      });
      child.id = 8;
      child.parentAdminId = 7;
      adminRepository.findOne.mockResolvedValue(parent);
      adminRepository.find.mockResolvedValue([child]);

      // when
      const result = await adminService.getChildAdmins('parent-admin@test.com');

      // then
      expect(adminRepository.find).toHaveBeenCalledWith({
        where: { parentAdminId: 7 },
      });
      expect(result).toEqual([
        { id: 8, email: 'child-admin@test.com', name: child.name },
      ]);
    });
  });

  describe('deleteChildAdmin', () => {
    it('대상 관리자가 존재하지 않으면 NotFoundException을 던진다.', async () => {
      // given
      const admin = await AdminFixture.createAdminCryptFixture({
        email: 'parent-admin@test.com',
      });
      admin.id = 7;
      adminRepository.findOne
        .mockResolvedValueOnce(admin)
        .mockResolvedValueOnce(null);

      // when & then
      await expect(
        adminService.deleteChildAdmin('parent-admin@test.com', 999),
      ).rejects.toThrow(NotFoundException);
      expect(adminRepository.delete).not.toHaveBeenCalled();
    });

    it('본인이 생성한 계정이 아니면 ForbiddenException을 던진다.', async () => {
      // given
      const admin = await AdminFixture.createAdminCryptFixture({
        email: 'parent-admin@test.com',
      });
      admin.id = 7;
      const target = await AdminFixture.createAdminCryptFixture({
        email: 'other-child@test.com',
      });
      target.id = 8;
      target.parentAdminId = 99;
      adminRepository.findOne
        .mockResolvedValueOnce(admin)
        .mockResolvedValueOnce(target);

      // when & then
      await expect(
        adminService.deleteChildAdmin('parent-admin@test.com', 8),
      ).rejects.toThrow(ForbiddenException);
      expect(adminRepository.delete).not.toHaveBeenCalled();
    });

    it('본인이 생성한 계정이면 삭제하고 무효화 키를 등록한다.', async () => {
      // given
      const admin = await AdminFixture.createAdminCryptFixture({
        email: 'parent-admin@test.com',
      });
      admin.id = 7;
      const target = await AdminFixture.createAdminCryptFixture({
        email: 'child-admin@test.com',
      });
      target.id = 8;
      target.parentAdminId = 7;
      adminRepository.findOne
        .mockResolvedValueOnce(admin)
        .mockResolvedValueOnce(target);
      adminRepository.find.mockResolvedValue([]);

      // when
      await adminService.deleteChildAdmin('parent-admin@test.com', 8);

      // then
      expect(adminRepository.delete).toHaveBeenCalledWith({ id: 8 });
      expect(redisService.setex).toHaveBeenCalledTimes(1);
      expect(redisService.setex).toHaveBeenCalledWith(
        `${REDIS_KEYS.ADMIN_INVALIDATED_PREFIX}:child-admin@test.com`,
        SESSION_TTL,
        '1',
      );
    });
  });
});
