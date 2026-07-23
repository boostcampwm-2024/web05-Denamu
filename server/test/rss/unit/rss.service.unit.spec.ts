import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import axios from 'axios';
import { DataSource } from 'typeorm';

import { AdminRepository } from '@admin/repository/admin.repository';

import { FeedRepository } from '@feed/repository/feed.repository';

import { SubscriptionRepository } from '@subscribe/repository/subscription.repository';

import { EmailProducer } from '@common/email/email.producer';
import { WinstonLoggerService } from '@common/logger/logger.service';
import { NotifierRegistry } from '@common/notification/notifier-registry';
import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { RegisterRssRequestDto } from '@rss/dto/request/registerRss.dto';
import { ReadRssResponseDto } from '@rss/dto/response/readRss.dto';
import { ReadRssAcceptHistoryResponseDto } from '@rss/dto/response/readRssAcceptHistory.dto';
import { ReadRssRejectHistoryResponseDto } from '@rss/dto/response/readRssRejectHistory.dto';
import {
  RssAcceptRepository,
  RssRejectRepository,
  RssRepository,
} from '@rss/repository/rss.repository';
import { RssService } from '@rss/service/rss.service';

import { RssBlockRepository } from '@block/repository/rssBlock.repository';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe(`${RssService.name} Unit Test`, () => {
  let rssService: RssService;
  let rssRepository: jest.Mocked<
    Pick<RssRepository, 'findOne' | 'find' | 'insert' | 'delete'>
  >;
  let rssAcceptRepository: jest.Mocked<
    Pick<
      RssAcceptRepository,
      'findOne' | 'find' | 'delete' | 'update' | 'findRecentlyPublished'
    >
  >;
  let rssRejectRepository: jest.Mocked<Pick<RssRejectRepository, 'find'>>;
  let feedRepository: jest.Mocked<
    Pick<
      FeedRepository,
      | 'getFeedsByBlog'
      | 'setVisibilityForBlog'
      | 'countPublicFeedsByBlogIds'
      | 'getLatestPublicFeedDate'
      | 'findPublishActivityByBlogAndYear'
      | 'findPublishYearsByBlogId'
    >
  >;
  let subscriptionRepository: jest.Mocked<
    Pick<SubscriptionRepository, 'countByBlogIds' | 'getSubscribedBlogIds'>
  >;
  let emailProducer: jest.Mocked<
    Pick<
      EmailProducer,
      | 'produceRssRegistration'
      | 'produceRssRegistrationRequest'
      | 'produceRssRemoval'
      | 'produceRssCertification'
    >
  >;
  let manager: { save: jest.Mock; remove: jest.Mock; delete: jest.Mock };
  let dataSource: jest.Mocked<Pick<DataSource, 'transaction'>>;
  let redisService: jest.Mocked<
    Pick<RedisService, 'rpush' | 'set' | 'get' | 'del'>
  >;
  let adminRepository: jest.Mocked<Pick<AdminRepository, 'find'>>;
  let notifierRegistry: jest.Mocked<Pick<NotifierRegistry, 'sendAlert'>>;
  let logger: jest.Mocked<Pick<WinstonLoggerService, 'error'>>;
  let rssBlockRepository: jest.Mocked<
    Pick<RssBlockRepository, 'existsByBlockerAndRss'>
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    rssRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      insert: jest.fn(),
      delete: jest.fn(),
    };
    rssAcceptRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      findRecentlyPublished: jest.fn().mockResolvedValue([]),
    };
    rssRejectRepository = { find: jest.fn() };
    feedRepository = {
      getFeedsByBlog: jest.fn(),
      setVisibilityForBlog: jest.fn().mockResolvedValue(1),
      countPublicFeedsByBlogIds: jest.fn().mockResolvedValue(new Map()),
      getLatestPublicFeedDate: jest.fn().mockResolvedValue(null),
      findPublishActivityByBlogAndYear: jest.fn().mockResolvedValue([]),
      findPublishYearsByBlogId: jest.fn().mockResolvedValue([]),
    };
    subscriptionRepository = {
      countByBlogIds: jest.fn().mockResolvedValue(new Map()),
      getSubscribedBlogIds: jest.fn().mockResolvedValue([]),
    };
    emailProducer = {
      produceRssRegistration: jest.fn(),
      produceRssRegistrationRequest: jest.fn(),
      produceRssRemoval: jest.fn(),
      produceRssCertification: jest.fn(),
    };
    manager = { save: jest.fn(), remove: jest.fn(), delete: jest.fn() };
    dataSource = {
      transaction: jest.fn((cb: any) => cb(manager)),
    } as any;
    redisService = {
      rpush: jest.fn(),
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    };
    adminRepository = { find: jest.fn().mockResolvedValue([]) };
    notifierRegistry = { sendAlert: jest.fn() };
    logger = { error: jest.fn() };
    rssBlockRepository = {
      existsByBlockerAndRss: jest.fn().mockResolvedValue(false),
    };

    rssService = new RssService(
      rssRepository as unknown as RssRepository,
      rssAcceptRepository as unknown as RssAcceptRepository,
      rssRejectRepository as unknown as RssRejectRepository,
      feedRepository as unknown as FeedRepository,
      subscriptionRepository as unknown as SubscriptionRepository,
      emailProducer as unknown as EmailProducer,
      dataSource as unknown as DataSource,
      redisService as unknown as RedisService,
      adminRepository as unknown as AdminRepository,
      notifierRegistry as unknown as NotifierRegistry,
      logger as unknown as WinstonLoggerService,
      rssBlockRepository as unknown as RssBlockRepository,
    );
  });

  describe('createRss', () => {
    const dto = {
      blog: 'My Blog',
      rssUrl: 'https://blog.test/rss',
      toEntity: () => ({ name: 'My Blog', rssUrl: 'https://blog.test/rss' }),
    } as unknown as RegisterRssRequestDto;

    it('이미 신청된 RSS가 있으면 ConflictException을 던진다.', async () => {
      // given
      rssRepository.findOne.mockResolvedValue({
        rssUrl: 'https://blog.test/rss',
        name: 'My Blog',
      } as any);
      rssAcceptRepository.findOne.mockResolvedValue(null);

      // when & then
      await expect(rssService.createRss(dto)).rejects.toThrow(
        ConflictException,
      );
      expect(rssRepository.insert).not.toHaveBeenCalled();
    });

    it('중복이 없으면 RSS를 저장한다.', async () => {
      // given
      rssRepository.findOne.mockResolvedValue(null);
      rssAcceptRepository.findOne.mockResolvedValue(null);

      // when
      await rssService.createRss(dto);

      // then
      expect(rssRepository.insert).toHaveBeenCalledWith(dto.toEntity());
    });

    it('저장 후 수신 동의한 관리자에게 메일을 발송하고 디스코드 알림을 보낸다.', async () => {
      // given
      rssRepository.findOne.mockResolvedValue(null);
      rssAcceptRepository.findOne.mockResolvedValue(null);
      adminRepository.find.mockResolvedValue([
        { email: 'a@denamu.dev' },
        { email: 'b@denamu.dev' },
      ] as any);

      // when
      await rssService.createRss(dto);

      // then
      expect(adminRepository.find).toHaveBeenCalledWith({
        where: { emailNotification: true },
        select: ['email'],
      });
      expect(emailProducer.produceRssRegistrationRequest).toHaveBeenCalledTimes(
        2,
      );
      expect(emailProducer.produceRssRegistrationRequest).toHaveBeenCalledWith(
        dto.toEntity(),
        'a@denamu.dev',
      );
      expect(notifierRegistry.sendAlert).toHaveBeenCalledTimes(1);
    });

    it('알림 발송이 실패해도 신청 자체는 예외를 던지지 않는다.', async () => {
      // given
      rssRepository.findOne.mockResolvedValue(null);
      rssAcceptRepository.findOne.mockResolvedValue(null);
      adminRepository.find.mockRejectedValue(new Error('DB down'));

      // when & then
      await expect(rssService.createRss(dto)).resolves.not.toThrow();
      expect(rssRepository.insert).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
      // 메일 경로가 실패해도 디스코드 알림은 발송되어야 한다.
      expect(notifierRegistry.sendAlert).toHaveBeenCalledTimes(1);
    });
  });

  describe('readAllRss', () => {
    it('신청 목록을 조회하고 응답으로 변환한다.', async () => {
      // given
      const rssList = [] as any;
      rssRepository.find.mockResolvedValue(rssList);

      // when
      const result = await rssService.readAllRss();

      // then
      expect(rssRepository.find).toHaveBeenCalled();
      expect(result).toEqual(ReadRssResponseDto.toResponseDtoArray(rssList));
    });
  });

  describe('readAcceptHistory', () => {
    it('승인 이력을 id 내림차순으로 조회한다.', async () => {
      // given
      const list = [] as any;
      rssAcceptRepository.find.mockResolvedValue(list);

      // when
      const result = await rssService.readAcceptHistory();

      // then
      expect(rssAcceptRepository.find).toHaveBeenCalledWith({
        order: { id: 'DESC' },
      });
      expect(result).toEqual(
        ReadRssAcceptHistoryResponseDto.toResponseDtoArray(list),
      );
    });
  });

  describe('readRejectHistory', () => {
    it('거절 이력을 id 내림차순으로 조회한다.', async () => {
      // given
      const list = [] as any;
      rssRejectRepository.find.mockResolvedValue(list);

      // when
      const result = await rssService.readRejectHistory();

      // then
      expect(rssRejectRepository.find).toHaveBeenCalledWith({
        order: { id: 'DESC' },
      });
      expect(result).toEqual(
        ReadRssRejectHistoryResponseDto.toResponseDtoArray(list),
      );
    });
  });

  describe('acceptRss', () => {
    const param = { id: 1 };

    it('신청이 없으면 NotFoundException을 던진다.', async () => {
      // given
      rssRepository.findOne.mockResolvedValue(null);

      // when & then
      await expect(rssService.acceptRss(param)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('RSS URL이 유효하지 않으면 BadRequestException을 던진다.', async () => {
      // given
      rssRepository.findOne.mockResolvedValue({
        id: 1,
        rssUrl: 'https://invalid.test/rss',
      } as any);
      mockedAxios.get.mockRejectedValue(new Error('network'));

      // when & then
      await expect(rssService.acceptRss(param)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('유효하면 승인 처리 후 크롤 큐에 적재하고 승인 메일을 발송한다.', async () => {
      // given
      rssRepository.findOne.mockResolvedValue({
        id: 1,
        rssUrl: 'https://velog.test/rss',
        name: 'blog',
        userName: 'tester',
        email: 'a@test.com',
      } as any);
      mockedAxios.get.mockResolvedValue({ status: 200 });
      manager.save.mockResolvedValue({ id: 100 });

      // when
      await rssService.acceptRss(param);

      // then
      expect(redisService.rpush).toHaveBeenCalledWith(
        REDIS_KEYS.FULL_FEED_CRAWL_QUEUE,
        expect.any(String),
      );
      expect(emailProducer.produceRssRegistration).toHaveBeenCalledWith(
        { id: 100 },
        true,
      );
    });
  });

  describe('rejectRss', () => {
    const param = { id: 1 };
    const body = { description: '품질 미달' };

    it('신청이 없으면 NotFoundException을 던진다.', async () => {
      rssRepository.findOne.mockResolvedValue(null);
      await expect(rssService.rejectRss(param, body)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('거절 시 사유와 함께 거절 메일을 발송한다.', async () => {
      // given
      const rss = { id: 1, rssUrl: 'https://blog.test/rss' };
      rssRepository.findOne.mockResolvedValue(rss as any);
      manager.remove.mockResolvedValue(rss);

      // when
      await rssService.rejectRss(param, body);

      // then
      expect(emailProducer.produceRssRegistration).toHaveBeenCalledWith(
        rss,
        false,
        '품질 미달',
      );
    });
  });

  describe('requestRemove', () => {
    const dto = {
      blogUrl: 'https://blog.test/rss',
      email: 'a@test.com',
    };

    it('해당 RSS 데이터가 없으면 NotFoundException을 던진다.', async () => {
      // given
      rssAcceptRepository.findOne.mockResolvedValue(null);
      rssRepository.findOne.mockResolvedValue(null);

      // when & then
      await expect(rssService.requestRemove(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('인증 코드를 저장하고 삭제 인증 메일을 발송한다.', async () => {
      // given
      rssAcceptRepository.findOne.mockResolvedValue({
        userName: 'tester',
      } as any);
      rssRepository.findOne.mockResolvedValue(null);

      // when
      await rssService.requestRemove(dto);

      // then
      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining(REDIS_KEYS.RSS_REMOVE_KEY),
        dto.blogUrl,
        'EX',
        300,
      );
      expect(emailProducer.produceRssRemoval).toHaveBeenCalledWith(
        'tester',
        dto.email,
        dto.blogUrl,
        expect.any(String),
      );
    });
  });

  describe('deleteRss', () => {
    const dto = { code: 'cert-code' };
    const redisKey = `${REDIS_KEYS.RSS_REMOVE_KEY}:cert-code`;

    it('인증 코드가 만료되었으면 NotFoundException을 던진다.', async () => {
      // given
      redisService.get.mockResolvedValue(null);

      // when & then
      await expect(rssService.deleteRss(dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(redisService.del).not.toHaveBeenCalled();
    });

    it('이미 삭제된 RSS면 NotFoundException을 던지고 인증 코드는 정리한다.', async () => {
      // given
      redisService.get.mockResolvedValue('https://blog.test/rss');
      rssAcceptRepository.delete.mockResolvedValue({ affected: 0 } as any);
      rssRepository.delete.mockResolvedValue({ affected: 0 } as any);

      // when & then
      await expect(rssService.deleteRss(dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(redisService.del).toHaveBeenCalledWith(redisKey);
    });

    it('삭제에 성공하면 인증 코드를 정리한다.', async () => {
      // given
      redisService.get.mockResolvedValue('https://blog.test/rss');
      rssAcceptRepository.delete.mockResolvedValue({ affected: 1 } as any);
      rssRepository.delete.mockResolvedValue({ affected: 0 } as any);

      // when
      await rssService.deleteRss(dto);

      // then
      expect(redisService.del).toHaveBeenCalledWith(redisKey);
    });
  });

  describe('createRssCertification', () => {
    const user = {
      id: 10,
      email: 'me@test.com',
      userName: 'me',
      role: 'user',
    };

    it('이름과 일치하는 RSS가 없으면 NotFoundException을 던진다.', async () => {
      rssAcceptRepository.findOne.mockResolvedValue(null);

      await expect(
        rssService.createRssCertification(user, 'blog'),
      ).rejects.toThrow(NotFoundException);
    });

    it('이미 본인이 인증한 RSS면 ConflictException을 던진다.', async () => {
      rssAcceptRepository.findOne.mockResolvedValue({
        id: 1,
        userId: 10,
      } as any);

      await expect(
        rssService.createRssCertification(user, 'blog'),
      ).rejects.toThrow(ConflictException);
      expect(rssAcceptRepository.update).not.toHaveBeenCalled();
    });

    it('다른 사용자가 인증한 RSS면 ConflictException을 던진다.', async () => {
      rssAcceptRepository.findOne.mockResolvedValue({
        id: 1,
        userId: 99,
      } as any);

      await expect(
        rssService.createRssCertification(user, 'blog'),
      ).rejects.toThrow(ConflictException);
    });

    it('RSS 이메일과 사용자 이메일이 같으면 즉시 연결하고 메일을 보내지 않는다.', async () => {
      rssAcceptRepository.findOne.mockResolvedValue({
        id: 1,
        userId: null,
        email: 'me@test.com',
        userName: 'tester',
        blogPlatform: 'velog',
      } as any);

      const result = await rssService.createRssCertification(user, 'blog');

      expect(rssAcceptRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1 }),
        { userId: 10 },
      );
      expect(emailProducer.produceRssCertification).not.toHaveBeenCalled();
      expect(redisService.set).not.toHaveBeenCalled();
      expect(result.certified).toBe(true);
    });

    it('이메일이 다르면 인증 코드를 저장하고 인증 메일을 발송한다.', async () => {
      rssAcceptRepository.findOne.mockResolvedValue({
        id: 1,
        userId: null,
        email: 'other@test.com',
        name: 'blog',
        userName: 'tester',
        blogPlatform: 'velog',
      } as any);

      const result = await rssService.createRssCertification(user, 'blog');

      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining(REDIS_KEYS.RSS_CERTIFICATION_KEY),
        expect.any(String),
        'EX',
        300,
      );
      expect(emailProducer.produceRssCertification).toHaveBeenCalledWith(
        'tester',
        'blog',
        expect.any(String),
        'other@test.com',
        user.email,
      );
      expect(rssAcceptRepository.update).not.toHaveBeenCalled();
      expect(result.certified).toBe(false);
    });
  });

  describe('verifyRssCertification', () => {
    const user = {
      id: 10,
      email: 'me@test.com',
      userName: 'me',
      role: 'user',
    };
    const code = 'cert-code';
    const redisKey = `${REDIS_KEYS.RSS_CERTIFICATION_KEY}:${code}`;

    it('인증 코드가 만료되었으면 NotFoundException을 던진다.', async () => {
      redisService.get.mockResolvedValue(null);

      await expect(
        rssService.verifyRssCertification(user, code),
      ).rejects.toThrow(NotFoundException);
      expect(redisService.del).not.toHaveBeenCalled();
    });

    it('본인의 인증 요청이 아니면 ForbiddenException을 던진다.', async () => {
      redisService.get.mockResolvedValue(
        JSON.stringify({ rssAcceptId: 1, userId: 99 }),
      );

      await expect(
        rssService.verifyRssCertification(user, code),
      ).rejects.toThrow(ForbiddenException);
      expect(rssAcceptRepository.update).not.toHaveBeenCalled();
    });

    it('정상 검증 시 RSS를 연결하고 인증 코드를 정리한다.', async () => {
      redisService.get.mockResolvedValue(
        JSON.stringify({ rssAcceptId: 1, userId: 10 }),
      );

      await rssService.verifyRssCertification(user, code);

      expect(rssAcceptRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1 }),
        { userId: 10 },
      );
      expect(redisService.del).toHaveBeenCalledWith(redisKey);
    });

    it('이미 인증된 RSS면 ConflictException을 던지고 인증 코드는 정리한다.', async () => {
      redisService.get.mockResolvedValue(
        JSON.stringify({ rssAcceptId: 1, userId: 10 }),
      );
      rssAcceptRepository.update.mockResolvedValue({ affected: 0 } as any);

      await expect(
        rssService.verifyRssCertification(user, code),
      ).rejects.toThrow(ConflictException);
      expect(redisService.del).toHaveBeenCalledWith(redisKey);
    });
  });

  describe('deleteRssCertification', () => {
    const user = {
      id: 10,
      email: 'me@test.com',
      userName: 'me',
      role: 'user',
    };

    it('RSS가 없으면 NotFoundException을 던진다.', async () => {
      rssAcceptRepository.findOne.mockResolvedValue(null);

      await expect(rssService.deleteRssCertification(user, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('본인이 인증한 RSS가 아니면 ForbiddenException을 던진다.', async () => {
      rssAcceptRepository.findOne.mockResolvedValue({
        id: 1,
        userId: 99,
      } as any);

      await expect(rssService.deleteRssCertification(user, 1)).rejects.toThrow(
        ForbiddenException,
      );
      expect(rssAcceptRepository.update).not.toHaveBeenCalled();
    });

    it('본인이 인증한 RSS면 연결을 해제한다.', async () => {
      rssAcceptRepository.findOne.mockResolvedValue({
        id: 1,
        userId: 10,
      } as any);

      await rssService.deleteRssCertification(user, 1);

      expect(rssAcceptRepository.update).toHaveBeenCalledWith(
        { id: 1 },
        { userId: null },
      );
    });
  });

  describe('getOwnedRssFeeds', () => {
    const user = { id: 10, email: 'me@test.com', userName: 'me', role: 'user' };

    it('본인이 인증한 RSS가 아니면 ForbiddenException을 던진다.', async () => {
      rssAcceptRepository.findOne.mockResolvedValue({ id: 1, userId: 99 } as any);

      await expect(
        rssService.getOwnedRssFeeds(user, 1, { limit: 10 }),
      ).rejects.toThrow(ForbiddenException);
      expect(feedRepository.getFeedsByBlog).not.toHaveBeenCalled();
    });

    it('비공개 글 포함 전체 게시글을 커서로 조회한다(onlyPublic=false).', async () => {
      rssAcceptRepository.findOne.mockResolvedValue({ id: 1, userId: 10 } as any);
      feedRepository.getFeedsByBlog.mockResolvedValue([
        { id: 3, isPublic: true },
        { id: 2, isPublic: false },
        { id: 1, isPublic: true },
      ] as any);

      const result = await rssService.getOwnedRssFeeds(user, 1, { lastId: 4, limit: 2 });

      expect(feedRepository.getFeedsByBlog).toHaveBeenCalledWith(1, 4, 2, false);
      expect(result.result).toHaveLength(2);
      expect(result.hasMore).toBe(true);
      expect(result.lastId).toBe(2);
    });
  });

  describe('setFeedVisibility', () => {
    const user = { id: 10, email: 'me@test.com', userName: 'me', role: 'user' };

    it('본인이 인증한 RSS가 아니면 ForbiddenException을 던진다.', async () => {
      rssAcceptRepository.findOne.mockResolvedValue({ id: 1, userId: 99 } as any);

      await expect(
        rssService.setFeedVisibility(user, 1, 5, false),
      ).rejects.toThrow(ForbiddenException);
      expect(feedRepository.setVisibilityForBlog).not.toHaveBeenCalled();
    });

    it('게시글이 해당 RSS 소속이 아니면(affected=0) NotFoundException을 던진다.', async () => {
      rssAcceptRepository.findOne.mockResolvedValue({ id: 1, userId: 10 } as any);
      feedRepository.setVisibilityForBlog.mockResolvedValue(0);

      await expect(
        rssService.setFeedVisibility(user, 1, 5, false),
      ).rejects.toThrow(NotFoundException);
    });

    it('소유/소속 검증 통과 시 공개 상태를 변경한다.', async () => {
      rssAcceptRepository.findOne.mockResolvedValue({ id: 1, userId: 10 } as any);
      feedRepository.setVisibilityForBlog.mockResolvedValue(1);

      await rssService.setFeedVisibility(user, 1, 5, false);

      expect(feedRepository.setVisibilityForBlog).toHaveBeenCalledWith(5, 1, false);
    });
  });

  describe('getRecentRss', () => {
    it('limit 10으로 조회하고 응답 DTO 배열로 변환한다.', async () => {
      // given
      const lastPublishedAt = new Date('2025-12-10T00:00:00.000Z');
      rssAcceptRepository.findRecentlyPublished.mockResolvedValue([
        {
          id: 1,
          name: 'blogA',
          blogPlatform: 'velog',
          lastPublishedAt,
          latestFeedId: '11',
        },
        {
          id: 2,
          name: 'blogB',
          blogPlatform: 'tistory',
          lastPublishedAt,
          latestFeedId: '22',
        },
      ]);

      // when
      const result = await rssService.getRecentRss();

      // then
      expect(rssAcceptRepository.findRecentlyPublished).toHaveBeenCalledWith(
        10,
        undefined,
      );
      expect(result).toEqual([
        {
          id: 1,
          name: 'blogA',
          blogPlatform: 'velog',
          lastPublishedAt,
          latestFeedId: 11,
        },
        {
          id: 2,
          name: 'blogB',
          blogPlatform: 'tistory',
          lastPublishedAt,
          latestFeedId: 22,
        },
      ]);
    });

    it('발행된 RSS가 없으면 빈 배열을 반환한다.', async () => {
      // given
      rssAcceptRepository.findRecentlyPublished.mockResolvedValue([]);

      // when
      const result = await rssService.getRecentRss();

      // then
      expect(result).toEqual([]);
    });
  });

  describe('getRssInfo', () => {
    it('RSS가 없으면 NotFoundException을 던진다.', async () => {
      rssAcceptRepository.findOne.mockResolvedValue(null);

      await expect(rssService.getRssInfo(1)).rejects.toThrow(NotFoundException);
    });

    it('소유자 없는 RSS는 owner=null, isOwner=false로 반환한다.', async () => {
      // given
      rssAcceptRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'blog',
        userName: '작성자',
        rssUrl: 'https://blog.test/rss',
        blogPlatform: 'etc',
        userId: null,
        user: null,
      } as any);
      feedRepository.countPublicFeedsByBlogIds.mockResolvedValue(
        new Map([[1, 5]]),
      );
      subscriptionRepository.countByBlogIds.mockResolvedValue(new Map([[1, 2]]));
      const latest = new Date('2025-01-02T00:00:00.000Z');
      feedRepository.getLatestPublicFeedDate.mockResolvedValue(latest);

      // when
      const result = await rssService.getRssInfo(1);

      // then
      expect(rssAcceptRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { user: true },
      });
      expect(result.owner).toBeNull();
      expect(result.isOwner).toBe(false);
      expect(result.isSubscribed).toBe(false);
      expect(result.feedCount).toBe(5);
      expect(result.subscriberCount).toBe(2);
      expect(result.lastPublishedAt).toBe(latest);
    });

    it('소유자 있는 RSS는 owner 정보를 포함하고 viewer가 소유자면 isOwner=true.', async () => {
      // given
      rssAcceptRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'blog',
        userName: '작성자',
        rssUrl: 'https://blog.test/rss',
        blogPlatform: 'velog',
        userId: 10,
        user: { id: 10, userName: '김개발', profileImage: 'img.png' },
      } as any);
      feedRepository.countPublicFeedsByBlogIds.mockResolvedValue(new Map());
      subscriptionRepository.countByBlogIds.mockResolvedValue(new Map());
      feedRepository.getLatestPublicFeedDate.mockResolvedValue(null);
      subscriptionRepository.getSubscribedBlogIds.mockResolvedValue([1]);

      // when
      const result = await rssService.getRssInfo(1, 10);

      // then
      expect(result.owner).toEqual({
        id: 10,
        userName: '김개발',
        profileImage: 'img.png',
      });
      expect(result.isOwner).toBe(true);
      expect(result.isSubscribed).toBe(true);
    });

    it('viewer가 소유자가 아니면 isOwner=false, 구독 여부를 반영한다.', async () => {
      rssAcceptRepository.findOne.mockResolvedValue({
        id: 1,
        userId: 10,
        user: { id: 10, userName: '김개발', profileImage: null },
      } as any);
      feedRepository.countPublicFeedsByBlogIds.mockResolvedValue(new Map());
      subscriptionRepository.countByBlogIds.mockResolvedValue(new Map());
      feedRepository.getLatestPublicFeedDate.mockResolvedValue(null);
      subscriptionRepository.getSubscribedBlogIds.mockResolvedValue([99]);

      const result = await rssService.getRssInfo(1, 20);

      expect(result.isOwner).toBe(false);
      expect(result.isSubscribed).toBe(false);
      expect(result.owner?.profileImage).toBeNull();
    });
  });

  describe('getRssFeeds', () => {
    const makeFeed = (id: number) =>
      ({
        id,
        title: `t${id}`,
        path: `p${id}`,
        thumbnail: `th${id}`,
        createdAt: new Date(),
        commentCount: id,
        likeCount: id,
      }) as any;

    it('RSS가 없으면 NotFoundException을 던진다.', async () => {
      rssAcceptRepository.findOne.mockResolvedValue(null);

      await expect(
        rssService.getRssFeeds(1, { limit: 10 }),
      ).rejects.toThrow(NotFoundException);
      expect(feedRepository.getFeedsByBlog).not.toHaveBeenCalled();
    });

    it('공개 게시글만 커서로 조회하고 썸네일을 포함한다(onlyPublic=true).', async () => {
      rssAcceptRepository.findOne.mockResolvedValue({ id: 1 } as any);
      feedRepository.getFeedsByBlog.mockResolvedValue([
        makeFeed(10),
        makeFeed(9),
        makeFeed(8),
      ]);

      const result = await rssService.getRssFeeds(1, { lastId: 11, limit: 2 });

      expect(feedRepository.getFeedsByBlog).toHaveBeenCalledWith(
        1,
        11,
        2,
        true,
        undefined,
      );
      expect(result.result).toHaveLength(2);
      expect(result.hasMore).toBe(true);
      expect(result.lastId).toBe(9);
      expect(result.result[0].thumbnail).toBe('th10');
    });

    it('date를 넘기면 해당 날짜 필터를 저장소에 전달한다.', async () => {
      rssAcceptRepository.findOne.mockResolvedValue({ id: 1 } as any);
      feedRepository.getFeedsByBlog.mockResolvedValue([makeFeed(10)]);

      await rssService.getRssFeeds(1, { limit: 10, date: '2025-01-15' });

      expect(feedRepository.getFeedsByBlog).toHaveBeenCalledWith(
        1,
        undefined,
        10,
        true,
        '2025-01-15',
      );
    });

    it('조회 결과가 없으면 lastId=0, hasMore=false로 반환한다.', async () => {
      rssAcceptRepository.findOne.mockResolvedValue({ id: 1 } as any);
      feedRepository.getFeedsByBlog.mockResolvedValue([]);

      const result = await rssService.getRssFeeds(1, { limit: 10 });

      expect(result.result).toHaveLength(0);
      expect(result.lastId).toBe(0);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('getRssActivities', () => {
    it('RSS가 없으면 NotFoundException을 던진다.', async () => {
      rssAcceptRepository.findOne.mockResolvedValue(null);

      await expect(rssService.getRssActivities(1, 2025)).rejects.toThrow(
        NotFoundException,
      );
      expect(
        feedRepository.findPublishActivityByBlogAndYear,
      ).not.toHaveBeenCalled();
    });

    it('일별 발행 건수를 viewCount로 매핑해 반환한다.', async () => {
      rssAcceptRepository.findOne.mockResolvedValue({ id: 1 } as any);
      feedRepository.findPublishActivityByBlogAndYear.mockResolvedValue([
        { date: '2025-01-05', count: 2 },
        { date: '2025-03-01', count: 5 },
      ]);

      const result = await rssService.getRssActivities(1, 2025);

      expect(
        feedRepository.findPublishActivityByBlogAndYear,
      ).toHaveBeenCalledWith(1, 2025);
      expect(result.dailyActivities).toEqual([
        { date: '2025-01-05', viewCount: 2 },
        { date: '2025-03-01', viewCount: 5 },
      ]);
    });
  });

  describe('getRssActivityYears', () => {
    it('RSS가 없으면 NotFoundException을 던진다.', async () => {
      rssAcceptRepository.findOne.mockResolvedValue(null);

      await expect(rssService.getRssActivityYears(1)).rejects.toThrow(
        NotFoundException,
      );
      expect(feedRepository.findPublishYearsByBlogId).not.toHaveBeenCalled();
    });

    it('발행 이력이 있는 연도 목록을 반환한다.', async () => {
      rssAcceptRepository.findOne.mockResolvedValue({ id: 1 } as any);
      feedRepository.findPublishYearsByBlogId.mockResolvedValue([2025, 2024]);

      const result = await rssService.getRssActivityYears(1);

      expect(feedRepository.findPublishYearsByBlogId).toHaveBeenCalledWith(1);
      expect(result).toEqual([2025, 2024]);
    });
  });

  describe('identifyPlatformFromRssUrl (private)', () => {
    it.each([
      ['https://medium.com/feed', 'medium'],
      ['https://blog.tistory.com/rss', 'tistory'],
      ['https://v2.velog.io/rss', 'velog'],
      ['https://user.github.io/feed', 'github'],
      ['https://unknown.dev/rss', 'etc'],
    ])('%s → %s 플랫폼으로 식별한다.', (url, expected) => {
      const svc = rssService as unknown as {
        identifyPlatformFromRssUrl(rssUrl: string): string;
      };
      expect(svc.identifyPlatformFromRssUrl(url)).toBe(expected);
    });
  });
});
