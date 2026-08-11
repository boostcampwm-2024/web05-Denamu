import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { Response } from 'express';
import { DataSource, LessThan } from 'typeorm';

import { EmailProducer } from '@common/email/email.producer';
import { Payload } from '@common/guard/jwt.guard';
import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { FeedRepository } from '@feed/repository/feed.repository';

import { FileService } from '@file/service/file.service';

import { RssAccept } from '@rss/entity/rss.entity';
import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { SubscriptionRepository } from '@subscribe/repository/subscription.repository';

import { UserSuspension } from '@suspension/entity/userSuspension.entity';
import { UserSuspensionRepository } from '@suspension/repository/userSuspension.repository';

import { PROFILE_IMAGE_DAILY_LIMIT } from '@user/constant/user.constants';
import { RegisterUserRequestDto } from '@user/dto/request/registerUser.dto';
import { SearchUserRequestDto } from '@user/dto/request/searchUser.dto';
import { CheckEmailDuplicationResponseDto } from '@user/dto/response/checkEmailDuplication.dto';
import { CheckUserNameDuplicationResponseDto } from '@user/dto/response/checkUserNameDuplication.dto';
import { CreateAccessTokenResponseDto } from '@user/dto/response/createAccessToken.dto';
import { GetUserProfileResponseDto } from '@user/dto/response/getUserProfile.dto';
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
    Pick<
      UserRepository,
      | 'findOneBy'
      | 'findOne'
      | 'save'
      | 'remove'
      | 'update'
      | 'searchUserList'
      | 'isUserBlocked'
    >
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
  let feedRepository: jest.Mocked<
    Pick<FeedRepository, 'countPublicFeedsByBlogIds'>
  >;
  let subscriptionRepository: jest.Mocked<
    Pick<SubscriptionRepository, 'countByBlogIds' | 'getSubscribedBlogIds'>
  >;
  let manager: { remove: jest.Mock; delete: jest.Mock };
  let dataSource: jest.Mocked<Pick<DataSource, 'transaction'>>;
  let userSuspensionRepository: jest.Mocked<
    Pick<UserSuspensionRepository, 'findActiveSuspension'>
  >;

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
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      searchUserList: jest.fn(),
      isUserBlocked: jest.fn(),
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
    feedRepository = {
      countPublicFeedsByBlogIds: jest.fn().mockResolvedValue(new Map()),
    };
    subscriptionRepository = {
      countByBlogIds: jest.fn().mockResolvedValue(new Map()),
      getSubscribedBlogIds: jest.fn().mockResolvedValue([]),
    };
    manager = { remove: jest.fn(), delete: jest.fn() };
    dataSource = {
      transaction: jest.fn((cb: any) => cb(manager)),
    } as any;
    userSuspensionRepository = {
      findActiveSuspension: jest.fn().mockResolvedValue(null),
    };

    userService = new UserService(
      userRepository as unknown as UserRepository,
      redisService as unknown as RedisService,
      emailProducer as unknown as EmailProducer,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
      fileService as unknown as FileService,
      rssAcceptRepository as unknown as RssAcceptRepository,
      feedRepository as unknown as FeedRepository,
      subscriptionRepository as unknown as SubscriptionRepository,
      dataSource as unknown as DataSource,
      userSuspensionRepository as unknown as UserSuspensionRepository,
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

  describe('searchUserList', () => {
    it('닉네임 검색 결과를 id·닉네임·프로필 이미지로 매핑하고 페이지 정보를 계산한다.', async () => {
      // given
      const users = [
        UserFixture.createUserFixture({
          userName: '김개발',
          profileImage: 'https://denamu.dev/profile.png',
        }),
        UserFixture.createUserFixture({
          userName: '김철수',
          profileImage: null,
        }),
      ] as User[];
      users[0].id = 1;
      users[1].id = 2;
      userRepository.searchUserList.mockResolvedValue([users, 2]);

      // when
      const result = await userService.searchUserList(
        new SearchUserRequestDto({ find: '김', page: 1, limit: 5 }),
      );

      // then
      expect(result).toEqual({
        totalCount: 2,
        result: [
          {
            id: 1,
            userName: '김개발',
            profileImage: 'https://denamu.dev/profile.png',
          },
          { id: 2, userName: '김철수', profileImage: null },
        ],
        totalPages: 1,
        limit: 5,
      });
    });

    it('page와 limit으로 offset을 계산해 레포지토리에 전달한다.', async () => {
      // given
      userRepository.searchUserList.mockResolvedValue([[], 0]);

      // when
      await userService.searchUserList(
        new SearchUserRequestDto({ find: '김', page: 3, limit: 4 }),
      );

      // then
      expect(userRepository.searchUserList).toHaveBeenCalledWith(
        '김',
        4,
        8,
        undefined,
      );
    });

    it('검색 결과가 없으면 빈 배열과 0건을 반환한다.', async () => {
      // given
      userRepository.searchUserList.mockResolvedValue([[], 0]);

      // when
      const result = await userService.searchUserList(
        new SearchUserRequestDto({ find: '없음', page: 1, limit: 5 }),
      );

      // then
      expect(result).toEqual({
        totalCount: 0,
        result: [],
        totalPages: 0,
        limit: 5,
      });
    });
  });

  describe('getUserProfile', () => {
    it('존재하지 않는 사용자면 NotFoundException을 던진다.', async () => {
      userRepository.findOneBy.mockResolvedValue(null);
      await expect(userService.getUserProfile(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('사용자의 이름·이미지·소개와 스트릭 통계를 응답으로 변환해 반환한다.', async () => {
      // given
      const user = UserFixture.createUserFixture({
        userName: '김개발',
        profileImage: 'https://denamu.dev/objects/PROFILE_IMAGE/a.png',
        introduction: '안녕하세요! 김개발입니다.',
        maxStreak: 15,
        currentStreak: 7,
        totalViews: 120,
      });
      userRepository.findOneBy.mockResolvedValue(user);

      // when
      const result = await userService.getUserProfile(1);

      // then
      expect(result).toEqual(GetUserProfileResponseDto.toResponseDto(user));
      expect(result.maxStreak).toBe(15);
      expect(result.currentStreak).toBe(7);
      expect(result.totalViews).toBe(120);
    });

    it('이미지·소개가 미설정이면 해당 필드를 null로 반환한다.', async () => {
      // given
      const user = UserFixture.createUserFixture({
        profileImage: null,
        introduction: null,
      });
      userRepository.findOneBy.mockResolvedValue(user);

      // when
      const result = await userService.getUserProfile(1);

      // then
      expect(result.profileImage).toBeNull();
      expect(result.introduction).toBeNull();
    });

    it('본인이 조회하면 이메일 수신 동의 필드를 포함한다.', async () => {
      // given
      const user = UserFixture.createUserFixture({
        marketingEmailAgreed: true,
        inactivityEmailAgreed: false,
        noticeEmailAgreed: true,
      });
      user.id = 1;
      userRepository.findOneBy.mockResolvedValue(user);

      // when
      const result = await userService.getUserProfile(1, {
        id: 1,
      } as Payload);

      // then
      expect(result.marketingEmailAgreed).toBe(true);
      expect(result.inactivityEmailAgreed).toBe(false);
      expect(result.noticeEmailAgreed).toBe(true);
    });

    it('타인이 조회하면 이메일 수신 동의 필드를 포함하지 않는다.', async () => {
      // given
      const user = UserFixture.createUserFixture({
        marketingEmailAgreed: true,
        inactivityEmailAgreed: false,
        noticeEmailAgreed: true,
      });
      user.id = 1;
      userRepository.findOneBy.mockResolvedValue(user);
      userRepository.isUserBlocked.mockResolvedValue(false);

      // when
      const result = await userService.getUserProfile(1, {
        id: 2,
      } as Payload);

      // then
      expect(result.marketingEmailAgreed).toBeUndefined();
      expect(result.inactivityEmailAgreed).toBeUndefined();
      expect(result.noticeEmailAgreed).toBeUndefined();
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
      expect(result).toEqual(
        CheckEmailDuplicationResponseDto.toResponseDto(true),
      );
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
      redisService.get.mockResolvedValue(
        JSON.stringify({ email: 'a@test.com' }),
      );
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
      redisService.get.mockResolvedValue(
        JSON.stringify({ email: 'a@test.com' }),
      );
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
    it('userId로 소유 RSS를 조회하고 공개 게시글 수와 함께 응답으로 변환한다.', async () => {
      // given
      const rssList = [{ id: 7, suspensionCount: 2 } as RssAccept];
      const feedCountMap = new Map<number, number>([[7, 3]]);
      rssAcceptRepository.find.mockResolvedValue(rssList);
      feedRepository.countPublicFeedsByBlogIds.mockResolvedValue(feedCountMap);

      // when
      const result = await userService.getUserRss(1);

      // then
      expect(rssAcceptRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: { id: 'DESC' },
      });
      expect(feedRepository.countPublicFeedsByBlogIds).toHaveBeenCalledWith([
        7,
      ]);
      expect(result).toStrictEqual(
        GetUserRssResponseDto.toResponseDtoArray(
          rssList,
          feedCountMap,
          new Map(),
          new Set(),
        ),
      );
      expect(result[0].feedCount).toBe(3);
      expect(result[0].suspensionCount).toBe(2);
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
        userService.loginUser({ ...dto, password: 'wrong!' }, createResponse()),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('비밀번호 미설정 소셜 계정이면 UnauthorizedException을 던진다.', async () => {
      // given
      const user = UserFixture.createUserFixture({ password: null });
      userRepository.findOne.mockResolvedValue(user);

      // when & then
      await expect(
        userService.loginUser(dto, createResponse()),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('정지된 계정이면 ForbiddenException을 던진다.', async () => {
      // given
      const user = await UserFixture.createUserCryptFixture();
      userRepository.findOne.mockResolvedValue(user);
      userSuspensionRepository.findActiveSuspension.mockResolvedValue({
        detail: '정지 처리',
        suspendedUntil: null,
      } as UserSuspension);

      // when & then
      await expect(
        userService.loginUser(dto, createResponse()),
      ).rejects.toThrow(ForbiddenException);
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

    it('userName만 들어오면 해당 필드만 갱신한다.', async () => {
      // given
      const user = UserFixture.createUserFixture({ userName: 'old' });
      userRepository.findOneBy.mockResolvedValue(user);

      // when
      await userService.updateUser(userId, {
        userName: 'new',
      });

      // then
      expect(userRepository.update).toHaveBeenCalledWith(
        { id: userId },
        { userName: 'new' },
      );
      expect(fileService.deleteByPath).not.toHaveBeenCalled();
    });

    it('존재하지 않는 사용자면 NotFoundException을 던지고 갱신하지 않는다.', async () => {
      // given
      userRepository.findOneBy.mockResolvedValue(null);

      // when & then
      await expect(
        userService.updateUser(userId, { userName: 'new' }),
      ).rejects.toThrow(NotFoundException);
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('갱신 시 unique 제약 위반(ER_DUP_ENTRY)이면 ConflictException으로 변환한다.', async () => {
      // given
      const user = UserFixture.createUserFixture({ userName: 'old' });
      userRepository.findOneBy.mockResolvedValue(user);
      userRepository.update.mockRejectedValue({ code: 'ER_DUP_ENTRY' });

      // when & then
      await expect(
        userService.updateUser(userId, { userName: 'taken' }),
      ).rejects.toThrow(ConflictException);
    });

    it('이메일 수신 동의 값이 들어오면 해당 필드만 갱신한다.', async () => {
      // given
      const user = UserFixture.createUserFixture();
      userRepository.findOneBy.mockResolvedValue(user);

      // when
      await userService.updateUser(userId, {
        marketingEmailAgreed: true,
        inactivityEmailAgreed: false,
      });

      // then
      expect(userRepository.update).toHaveBeenCalledWith(
        { id: userId },
        {
          marketingEmailAgreed: true,
          marketingEmailAgreedAt: expect.any(Date),
          inactivityEmailAgreed: false,
          inactivityEmailAgreedAt: expect.any(Date),
        },
      );
    });

    it('이메일 수신 동의 값이 없으면 갱신 대상에 포함하지 않는다.', async () => {
      // given
      const user = UserFixture.createUserFixture();
      userRepository.findOneBy.mockResolvedValue(user);

      // when
      await userService.updateUser(userId, { introduction: '변경' });

      // then
      expect(userRepository.update).toHaveBeenCalledWith(
        { id: userId },
        { introduction: '변경' },
      );
    });

    it('갱신할 필드가 없으면 update를 호출하지 않는다.', async () => {
      // given
      const user = UserFixture.createUserFixture();
      userRepository.findOneBy.mockResolvedValue(user);

      // when
      await userService.updateUser(userId, {});

      // then
      expect(userRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('updateProfileImage', () => {
    const userId = 1;

    it('프로필 이미지가 변경되면 기존 파일을 삭제하고 한도 가드와 함께 원자적으로 갱신한다.', async () => {
      // given
      const user = UserFixture.createUserFixture({
        profileImage: 'old.png',
      });
      userRepository.findOneBy.mockResolvedValue(user);

      // when
      await userService.updateProfileImage(userId, 'new.png');

      // then
      expect(fileService.deleteByPath).toHaveBeenCalledWith('old.png');
      expect(userRepository.update).toHaveBeenCalledWith(
        {
          id: userId,
          profileImageChangeCount: LessThan(PROFILE_IMAGE_DAILY_LIMIT),
        },
        expect.objectContaining({
          profileImage: 'new.png',
          profileImageChangeCount: expect.any(Function),
        }),
      );
    });

    it('동일한 프로필 이미지면 파일을 삭제하지 않고 한도 가드도 걸지 않는다.', async () => {
      // given
      const user = UserFixture.createUserFixture({ profileImage: 'same.png' });
      userRepository.findOneBy.mockResolvedValue(user);

      // when
      await userService.updateProfileImage(userId, 'same.png');

      // then
      expect(fileService.deleteByPath).not.toHaveBeenCalled();
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('하루 변경 한도를 초과하면 BadRequestException을 던지고 파일을 삭제하지 않는다.', async () => {
      // given
      const user = UserFixture.createUserFixture({ profileImage: 'old.png' });
      userRepository.findOneBy.mockResolvedValue(user);
      userRepository.update.mockResolvedValue({ affected: 0 } as any);

      // when & then
      await expect(
        userService.updateProfileImage(userId, 'new.png'),
      ).rejects.toThrow(BadRequestException);
      expect(fileService.deleteByPath).not.toHaveBeenCalled();
    });
  });

  describe('checkUserNameDuplication', () => {
    it('닉네임이 존재하면 exists=true 응답을 반환한다.', async () => {
      userRepository.findOne.mockResolvedValue(UserFixture.createUserFixture());
      const result = await userService.checkUserNameDuplication('tester');
      expect(result).toEqual(
        CheckUserNameDuplicationResponseDto.toResponseDto(true),
      );
    });

    it('닉네임이 없으면 exists=false 응답을 반환한다.', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await userService.checkUserNameDuplication('tester');
      expect(result).toEqual(
        CheckUserNameDuplicationResponseDto.toResponseDto(false),
      );
    });
  });

  describe('changePassword', () => {
    const userId = 1;

    it('현재 비밀번호가 일치하면 새 비밀번호로 변경하고 전 기기를 로그아웃한다.', async () => {
      // given
      const user = await UserFixture.createUserCryptFixture({ id: userId });
      const before = user.password;
      userRepository.findOneBy.mockResolvedValue(user);

      // when
      await userService.changePassword(userId, {
        currentPassword: USER_DEFAULT_PASSWORD,
        newPassword: 'newPass1!',
      });

      // then
      expect(user.password).not.toBe(before);
      expect(userRepository.save).toHaveBeenCalledWith(user);
      expect(redisService.setex).toHaveBeenCalledWith(
        `${REDIS_KEYS.USER_INVALIDATED_PREFIX}:${userId}`,
        14 * 86400,
        expect.stringMatching(/^\d+$/),
      );
    });

    it('현재 비밀번호가 일치하지 않으면 UnauthorizedException을 던지고 저장하지 않는다.', async () => {
      // given
      const user = await UserFixture.createUserCryptFixture({ id: userId });
      userRepository.findOneBy.mockResolvedValue(user);

      // when & then
      await expect(
        userService.changePassword(userId, {
          currentPassword: 'wrongPass1!',
          newPassword: 'newPass1!',
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(redisService.setex).not.toHaveBeenCalled();
    });

    it('비밀번호 미설정 소셜 계정은 현재 비밀번호 없이 새로 설정하고 전 기기를 로그아웃한다.', async () => {
      // given
      const user = UserFixture.createUserFixture({
        id: userId,
        password: null,
      });
      userRepository.findOneBy.mockResolvedValue(user);

      // when
      await userService.changePassword(userId, {
        newPassword: 'newPass1!',
      });

      // then
      expect(user.password).toBeTruthy();
      expect(userRepository.save).toHaveBeenCalledWith(user);
      expect(redisService.setex).toHaveBeenCalledWith(
        `${REDIS_KEYS.USER_INVALIDATED_PREFIX}:${userId}`,
        14 * 86400,
        expect.stringMatching(/^\d+$/),
      );
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
        UserFixture.createUserFixture({ id: 1, providers: [] }),
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

    it('OAuth 회원가입자도 인증 코드를 저장하고 메일을 발송한다.', async () => {
      // given
      userRepository.findOne.mockResolvedValue(
        UserFixture.createUserFixture({
          id: 1,
          password: null,
          providers: [{}] as any,
        }),
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

    it('인증 코드는 유효하지만 유저가 없으면 코드를 삭제하고 NotFoundException을 던진다.', async () => {
      // given
      redisService.get.mockResolvedValue('1');
      userRepository.findOne.mockResolvedValue(null);

      // when & then
      await expect(
        userService.resetPassword('uuid', 'newPass1!'),
      ).rejects.toThrow(NotFoundException);
      expect(redisService.del).toHaveBeenCalledWith(
        `${REDIS_KEYS.USER_RESET_PASSWORD_KEY}:uuid`,
      );
      expect(userRepository.save).not.toHaveBeenCalled();
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
