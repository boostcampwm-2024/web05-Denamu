import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { Response } from 'express';
import { DataSource } from 'typeorm';

import { EmailProducer } from '@common/email/email.producer';
import { Payload } from '@common/guard/jwt.guard';
import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { FileService } from '@file/service/file.service';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { RegisterUserRequestDto } from '@user/dto/request/registerUser.dto';
import { CheckEmailDuplicationResponseDto } from '@user/dto/response/checkEmailDuplication.dto';
import { CreateAccessTokenResponseDto } from '@user/dto/response/createAccessToken.dto';
import { GetUserProfileImageResponseDto } from '@user/dto/response/getUserProfileImage.dto';
import { GetUserRssResponseDto } from '@user/dto/response/getUserRss.dto';
import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';
import { UserService } from '@user/service/user.service';

import {
  USER_DEFAULT_PASSWORD,
  UserFixture,
} from '@test/config/common/fixture/user.fixture';

describe(`${UserService.name} Unit Test`, () => {
  let userService: UserService;
  let userRepository: jest.Mocked<
    Pick<UserRepository, 'findOneBy' | 'findOne' | 'save' | 'remove'>
  >;
  let redisService: jest.Mocked<
    Pick<RedisService, 'set' | 'get' | 'del' | 'setex'>
  >;
  let emailProducer: jest.Mocked<
    Pick<
      EmailProducer,
      | 'produceUserCertification'
      | 'producePasswordReset'
      | 'produceAccountDeletion'
    >
  >;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>;
  let configService: jest.Mocked<Pick<ConfigService, 'get'>>;
  let fileService: jest.Mocked<Pick<FileService, 'deleteByPath'>>;
  let rssAcceptRepository: jest.Mocked<
    Pick<RssAcceptRepository, 'find' | 'update'>
  >;
  let manager: { remove: jest.Mock; delete: jest.Mock };
  let dataSource: jest.Mocked<Pick<DataSource, 'transaction'>>;

  const createResponse = () => ({ cookie: jest.fn() }) as unknown as Response;

  const DAY_MS = 24 * 60 * 60 * 1000;
  const midnightToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const daysAgo = (days: number) =>
    new Date(midnightToday().getTime() - days * DAY_MS);

  beforeEach(() => {
    userRepository = {
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    redisService = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
      setex: jest.fn(),
    };
    emailProducer = {
      produceUserCertification: jest.fn(),
      producePasswordReset: jest.fn(),
      produceAccountDeletion: jest.fn(),
    };
    jwtService = { sign: jest.fn().mockReturnValue('signed-token') };
    configService = { get: jest.fn().mockReturnValue('14d') };
    fileService = { deleteByPath: jest.fn() };
    rssAcceptRepository = { find: jest.fn(), update: jest.fn() };
    manager = { remove: jest.fn(), delete: jest.fn() };
    dataSource = {
      transaction: jest.fn((cb: any) => cb(manager)),
    } as any;

    userService = new UserService(
      userRepository as unknown as UserRepository,
      redisService as unknown as RedisService,
      emailProducer as unknown as EmailProducer,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
      fileService as unknown as FileService,
      rssAcceptRepository as unknown as RssAcceptRepository,
      dataSource as unknown as DataSource,
    );
  });

  describe('getUser', () => {
    it('존재하지 않으면 NotFoundException을 던진다.', async () => {
      userRepository.findOneBy.mockResolvedValue(null);
      await expect(userService.getUser(1)).rejects.toThrow(NotFoundException);
    });

    it('존재하면 사용자를 반환한다.', async () => {
      const user = UserFixture.createUserFixture();
      userRepository.findOneBy.mockResolvedValue(user);
      await expect(userService.getUser(1)).resolves.toBe(user);
    });
  });

  describe('getUserProfileImage', () => {
    it('존재하지 않는 사용자면 NotFoundException을 던진다.', async () => {
      userRepository.findOneBy.mockResolvedValue(null);
      await expect(userService.getUserProfileImage(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('프로필 이미지가 있으면 해당 URL 응답을 반환한다.', async () => {
      // given
      const user = UserFixture.createUserFixture({
        profileImage: 'https://denamu.dev/objects/PROFILE_IMAGE/a.png',
      });
      userRepository.findOneBy.mockResolvedValue(user);

      // when
      const result = await userService.getUserProfileImage(1);

      // then
      expect(result).toEqual(
        GetUserProfileImageResponseDto.toResponseDto(user),
      );
      expect(result.profileImage).toBe(
        'https://denamu.dev/objects/PROFILE_IMAGE/a.png',
      );
    });

    it('프로필 이미지가 미설정이면 null을 반환한다.', async () => {
      // given
      const user = UserFixture.createUserFixture({ profileImage: null });
      userRepository.findOneBy.mockResolvedValue(user);

      // when
      const result = await userService.getUserProfileImage(1);

      // then
      expect(result.profileImage).toBeNull();
    });
  });

  describe('updateUserActivity', () => {
    const arrangeUser = (overwrites: Partial<User>) => {
      const user = UserFixture.createUserFixture(overwrites);
      userRepository.findOneBy.mockResolvedValue(user);
      return user;
    };

    it('첫 활동(lastActiveDate 없음)이면 currentStreak을 1로 설정한다.', async () => {
      const user = arrangeUser({
        lastActiveDate: null,
        currentStreak: 7,
        maxStreak: 15,
      });
      await userService.updateUserActivity(user.id);
      expect(user.currentStreak).toBe(1);
      expect(user.maxStreak).toBe(15);
    });

    it('어제 활동(daysDiff === 1)이면 currentStreak을 1 증가시킨다.', async () => {
      const user = arrangeUser({
        lastActiveDate: daysAgo(1),
        currentStreak: 7,
        maxStreak: 15,
      });
      await userService.updateUserActivity(user.id);
      expect(user.currentStreak).toBe(8);
    });

    it('같은 날 재활동(daysDiff === 0)이면 currentStreak을 유지한다.', async () => {
      const user = arrangeUser({
        lastActiveDate: daysAgo(0),
        currentStreak: 7,
        maxStreak: 15,
      });
      await userService.updateUserActivity(user.id);
      expect(user.currentStreak).toBe(7);
    });

    it('하루를 건너뛰면(daysDiff > 1) currentStreak을 1로 초기화한다.', async () => {
      const user = arrangeUser({
        lastActiveDate: daysAgo(3),
        currentStreak: 7,
        maxStreak: 15,
      });
      await userService.updateUserActivity(user.id);
      expect(user.currentStreak).toBe(1);
    });

    it('currentStreak이 maxStreak을 넘으면 maxStreak을 갱신한다.', async () => {
      const user = arrangeUser({
        lastActiveDate: daysAgo(1),
        currentStreak: 15,
        maxStreak: 15,
      });
      await userService.updateUserActivity(user.id);
      expect(user.currentStreak).toBe(16);
      expect(user.maxStreak).toBe(16);
    });

    it('스트릭이 끊겨도 maxStreak은 유지한다.', async () => {
      const user = arrangeUser({
        lastActiveDate: daysAgo(3),
        currentStreak: 7,
        maxStreak: 15,
      });
      await userService.updateUserActivity(user.id);
      expect(user.currentStreak).toBe(1);
      expect(user.maxStreak).toBe(15);
    });

    it('호출 시 totalViews를 1 증가시키고 lastActiveDate를 오늘로 갱신한 뒤 저장한다.', async () => {
      const user = arrangeUser({
        lastActiveDate: daysAgo(1),
        totalViews: 120,
      });
      await userService.updateUserActivity(user.id);
      expect(user.totalViews).toBe(121);
      expect(user.lastActiveDate).toStrictEqual(midnightToday());
      expect(userRepository.save).toHaveBeenCalledWith(user);
    });

    it('존재하지 않는 사용자면 NotFoundException을 던지고 저장하지 않는다.', async () => {
      userRepository.findOneBy.mockResolvedValue(null);
      await expect(
        userService.updateUserActivity(Number.MAX_SAFE_INTEGER),
      ).rejects.toThrow(NotFoundException);
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('checkEmailDuplication', () => {
    it('이메일이 존재하면 exists=true 응답을 반환한다.', async () => {
      userRepository.findOne.mockResolvedValue(UserFixture.createUserFixture());
      const result = await userService.checkEmailDuplication('a@test.com');
      expect(result).toEqual(CheckEmailDuplicationResponseDto.toResponseDto(true));
    });

    it('이메일이 없으면 exists=false 응답을 반환한다.', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await userService.checkEmailDuplication('a@test.com');
      expect(result).toEqual(
        CheckEmailDuplicationResponseDto.toResponseDto(false),
      );
    });
  });

  describe('registerUser', () => {
    const dto = {
      email: 'new@test.com',
      password: USER_DEFAULT_PASSWORD,
      toEntity: () => UserFixture.createUserFixture({ email: 'new@test.com' }),
    } as unknown as RegisterUserRequestDto;

    it('이미 존재하는 이메일이면 ConflictException을 던진다.', async () => {
      userRepository.findOne.mockResolvedValue(UserFixture.createUserFixture());
      await expect(userService.registerUser(dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('신규 이메일이면 인증 정보를 Redis에 저장하고 인증 메일을 발송한다.', async () => {
      // given
      userRepository.findOne.mockResolvedValue(null);

      // when
      await userService.registerUser(dto);

      // then
      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining(REDIS_KEYS.USER_AUTH_KEY),
        expect.any(String),
        'EX',
        600,
      );
      expect(emailProducer.produceUserCertification).toHaveBeenCalled();
    });
  });

  describe('certificateUser', () => {
    it('인증 정보가 없으면 NotFoundException을 던진다.', async () => {
      redisService.get.mockResolvedValue(null);
      await expect(userService.certificateUser('uuid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('인증에 성공하면 Redis 키를 지우고 사용자를 저장한다.', async () => {
      // given
      redisService.get.mockResolvedValue(JSON.stringify({ email: 'a@test.com' }));
      userRepository.save.mockResolvedValue({
        id: 5,
        email: 'a@test.com',
      } as any);

      // when
      await userService.certificateUser('uuid');

      // then
      expect(redisService.del).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalledWith({ email: 'a@test.com' });
    });

    it('가입 완료 후 동일 이메일의 미연결 RSS에 user_id를 연결한다.', async () => {
      // given
      redisService.get.mockResolvedValue(JSON.stringify({ email: 'a@test.com' }));
      userRepository.save.mockResolvedValue({
        id: 5,
        email: 'a@test.com',
      } as any);

      // when
      await userService.certificateUser('uuid');

      // then
      expect(rssAcceptRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'a@test.com' }),
        { userId: 5 },
      );
    });
  });

  describe('getUserRss', () => {
    it('userId로 소유 RSS를 조회하고 응답으로 변환한다.', async () => {
      // given
      const rssList = [] as RssAccept[];
      rssAcceptRepository.find.mockResolvedValue(rssList);

      // when
      const result = await userService.getUserRss(1);

      // then
      expect(rssAcceptRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: { id: 'DESC' },
      });
      expect(result).toEqual(
        GetUserRssResponseDto.toResponseDtoArray(rssList),
      );
    });
  });

  describe('loginUser', () => {
    const dto = {
      email: 'a@test.com',
      password: USER_DEFAULT_PASSWORD,
    };

    it('비밀번호가 틀리면 UnauthorizedException을 던진다.', async () => {
      const user = await UserFixture.createUserCryptFixture();
      userRepository.findOne.mockResolvedValue(user);
      await expect(
        userService.loginUser(
          { ...dto, password: 'wrong!' },
          createResponse(),
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('로그인에 성공하면 refresh 쿠키를 설정하고 access token을 반환한다.', async () => {
      // given
      const user = await UserFixture.createUserCryptFixture();
      userRepository.findOne.mockResolvedValue(user);
      const cookie = jest.fn();
      const response = { cookie } as unknown as Response;

      // when
      const result = await userService.loginUser(dto, response);

      // then
      expect(cookie).toHaveBeenCalledWith(
        'refresh_token',
        'signed-token',
        expect.anything(),
      );
      expect(result).toEqual(
        CreateAccessTokenResponseDto.toResponseDto('signed-token'),
      );
    });
  });

  describe('updateUser', () => {
    const userId = 1;

    it('프로필 이미지가 변경되면 기존 파일을 삭제하고 교체한다.', async () => {
      // given
      const user = UserFixture.createUserFixture({
        profileImage: 'old.png',
      });
      userRepository.findOneBy.mockResolvedValue(user);

      // when
      await userService.updateUser(userId, {
        profileImage: 'new.png',
      });

      // then
      expect(fileService.deleteByPath).toHaveBeenCalledWith('old.png');
      expect(user.profileImage).toBe('new.png');
      expect(userRepository.save).toHaveBeenCalledWith(user);
    });

    it('동일한 프로필 이미지면 파일을 삭제하지 않는다.', async () => {
      // given
      const user = UserFixture.createUserFixture({ profileImage: 'same.png' });
      userRepository.findOneBy.mockResolvedValue(user);

      // when
      await userService.updateUser(userId, {
        profileImage: 'same.png',
      });

      // then
      expect(fileService.deleteByPath).not.toHaveBeenCalled();
    });

    it('userName만 들어오면 이름만 변경한다.', async () => {
      // given
      const user = UserFixture.createUserFixture({ userName: 'old' });
      userRepository.findOneBy.mockResolvedValue(user);

      // when
      await userService.updateUser(userId, {
        userName: 'new',
      });

      // then
      expect(user.userName).toBe('new');
      expect(fileService.deleteByPath).not.toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('사용자가 없으면 조용히 종료한다.', async () => {
      // given
      userRepository.findOne.mockResolvedValue(null);

      // when
      await userService.forgotPassword('a@test.com');

      // then
      expect(redisService.set).not.toHaveBeenCalled();
      expect(emailProducer.producePasswordReset).not.toHaveBeenCalled();
    });

    it('사용자가 있으면 인증 코드를 저장하고 메일을 발송한다.', async () => {
      // given
      userRepository.findOne.mockResolvedValue(
        UserFixture.createUserFixture({ id: 1 }),
      );

      // when
      await userService.forgotPassword('a@test.com');

      // then
      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining(REDIS_KEYS.USER_RESET_PASSWORD_KEY),
        expect.any(String),
        'EX',
        600,
      );
      expect(emailProducer.producePasswordReset).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('인증 코드가 유효하지 않으면 NotFoundException을 던진다.', async () => {
      redisService.get.mockResolvedValue(null);
      await expect(
        userService.resetPassword('uuid', 'newPass1!'),
      ).rejects.toThrow(NotFoundException);
    });

    it('인증에 성공하면 비밀번호를 해시해 저장하고 코드를 정리한다.', async () => {
      // given
      const user = UserFixture.createUserFixture();
      redisService.get.mockResolvedValue('1');
      userRepository.findOne.mockResolvedValue(user);

      // when
      await userService.resetPassword('uuid', 'newPass1!');

      // then
      expect(user.password).not.toBe('newPass1!');
      expect(redisService.del).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalledWith(user);
    });
  });

  describe('refreshAccessToken', () => {
    it('access token을 재발급해 응답으로 반환한다.', () => {
      // given
      const payload: Payload = {
        id: 1,
        email: 'a@test.com',
        userName: 'tester',
        role: 'user',
      };

      // when
      const result = userService.refreshAccessToken(payload, createResponse());

      // then
      expect(jwtService.sign).toHaveBeenCalled();
      expect(result).toEqual(
        CreateAccessTokenResponseDto.toResponseDto('signed-token'),
      );
    });
  });

  describe('requestDeleteAccount', () => {
    it('존재하지 않는 사용자면 NotFoundException을 던진다.', async () => {
      // given
      userRepository.findOneBy.mockResolvedValue(null);

      // when & then
      await expect(userService.requestDeleteAccount(1)).rejects.toThrow(
        NotFoundException,
      );
      expect(redisService.set).not.toHaveBeenCalled();
      expect(emailProducer.produceAccountDeletion).not.toHaveBeenCalled();
    });

    it('탈퇴 인증 코드를 저장하고 탈퇴 확인 메일을 발송한다.', async () => {
      // given
      const user = UserFixture.createUserFixture({ id: 1 });
      userRepository.findOneBy.mockResolvedValue(user);

      // when
      await userService.requestDeleteAccount(1);

      // then
      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining(REDIS_KEYS.USER_DELETE_ACCOUNT_KEY),
        JSON.stringify({ userId: 1, deleteRss: true }),
        'EX',
        600,
      );
      expect(emailProducer.produceAccountDeletion).toHaveBeenCalledWith(
        user,
        expect.any(String),
      );
    });

    it('deleteRss=false면 해당 값을 그대로 저장한다.', async () => {
      // given
      const user = UserFixture.createUserFixture({ id: 1 });
      userRepository.findOneBy.mockResolvedValue(user);

      // when
      await userService.requestDeleteAccount(1, false);

      // then
      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining(REDIS_KEYS.USER_DELETE_ACCOUNT_KEY),
        JSON.stringify({ userId: 1, deleteRss: false }),
        'EX',
        600,
      );
    });
  });

  describe('confirmDeleteAccount', () => {
    it('토큰이 유효하지 않으면 NotFoundException을 던진다.', async () => {
      redisService.get.mockResolvedValue(null);
      await expect(userService.confirmDeleteAccount('token')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deleteRss=true면 트랜잭션에서 RSS를 먼저 삭제한 뒤 사용자를 제거한다.', async () => {
      // given
      const user = UserFixture.createUserFixture({
        id: 1,
        profileImage: 'avatar.png',
      });
      redisService.get.mockResolvedValue(
        JSON.stringify({ userId: 1, deleteRss: true }),
      );
      userRepository.findOneBy.mockResolvedValue(user);

      // when
      await userService.confirmDeleteAccount('token');

      // then
      expect(fileService.deleteByPath).toHaveBeenCalledWith('avatar.png');
      expect(manager.delete).toHaveBeenCalledWith(RssAccept, { userId: 1 });
      expect(manager.remove).toHaveBeenCalledWith(user);
      // RSS 삭제가 user 제거보다 먼저 호출되어야 한다(FK SET NULL 함정 방지).
      expect(manager.delete.mock.invocationCallOrder[0]).toBeLessThan(
        manager.remove.mock.invocationCallOrder[0],
      );
      expect(redisService.setex).toHaveBeenCalledWith(
        `${REDIS_KEYS.USER_INVALIDATED_PREFIX}:1`,
        14 * 86400,
        expect.stringMatching(/^\d+$/),
      );
    });

    it('deleteRss=false면 RSS를 삭제하지 않고 사용자만 제거한다(FK SET NULL로 연결만 해제).', async () => {
      // given
      const user = UserFixture.createUserFixture({ id: 1, profileImage: null });
      redisService.get.mockResolvedValue(
        JSON.stringify({ userId: 1, deleteRss: false }),
      );
      userRepository.findOneBy.mockResolvedValue(user);

      // when
      await userService.confirmDeleteAccount('token');

      // then
      expect(manager.delete).not.toHaveBeenCalled();
      expect(manager.remove).toHaveBeenCalledWith(user);
    });
  });

  describe('parseTimeToSeconds (private)', () => {
    const parse = (time: string) =>
      (
        userService as unknown as {
          parseTimeToSeconds(time: string): number;
        }
      ).parseTimeToSeconds(time);

    it.each([
      ['30s', 30],
      ['15m', 15 * 60],
      ['2h', 2 * 3600],
      ['7d', 7 * 86400],
    ])('%s를 %i초로 변환한다.', (input, expected) => {
      expect(parse(input)).toBe(expected);
    });

    it('형식이 맞지 않고 fallback도 동일하면 기본값 3600을 반환한다.', () => {
      configService.get.mockReturnValue('invalid');
      expect(parse('invalid')).toBe(3600);
    });
  });
});
