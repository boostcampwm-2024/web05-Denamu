import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import axios from 'axios';
import { DataSource } from 'typeorm';

import { EmailProducer } from '@common/email/email.producer';
import { WinstonLoggerService } from '@common/logger/logger.service';
import { NotifierRegistry } from '@common/notification/notifier-registry';
import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { AdminRepository } from '@admin/repository/admin.repository';

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

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe(`${RssService.name} Unit Test`, () => {
  let rssService: RssService;
  let rssRepository: jest.Mocked<
    Pick<RssRepository, 'findOne' | 'find' | 'insert' | 'delete'>
  >;
  let rssAcceptRepository: jest.Mocked<
    Pick<RssAcceptRepository, 'findOne' | 'find' | 'delete' | 'update'>
  >;
  let rssRejectRepository: jest.Mocked<Pick<RssRejectRepository, 'find'>>;
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
  let redisService: jest.Mocked<Pick<RedisService, 'rpush' | 'set' | 'get' | 'del'>>;
  let adminRepository: jest.Mocked<Pick<AdminRepository, 'find'>>;
  let notifierRegistry: jest.Mocked<Pick<NotifierRegistry, 'sendAlert'>>;
  let logger: jest.Mocked<Pick<WinstonLoggerService, 'error'>>;

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
    };
    rssRejectRepository = { find: jest.fn() };
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
    redisService = { rpush: jest.fn(), set: jest.fn(), get: jest.fn(), del: jest.fn() };
    adminRepository = { find: jest.fn().mockResolvedValue([]) };
    notifierRegistry = { sendAlert: jest.fn() };
    logger = { error: jest.fn() };

    rssService = new RssService(
      rssRepository as unknown as RssRepository,
      rssAcceptRepository as unknown as RssAcceptRepository,
      rssRejectRepository as unknown as RssRejectRepository,
      emailProducer as unknown as EmailProducer,
      dataSource as unknown as DataSource,
      redisService as unknown as RedisService,
      adminRepository as unknown as AdminRepository,
      notifierRegistry as unknown as NotifierRegistry,
      logger as unknown as WinstonLoggerService,
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
      await expect(rssService.createRss(dto)).rejects.toThrow(ConflictException);
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
      expect(emailProducer.produceRssRegistrationRequest).toHaveBeenCalledTimes(2);
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
        'other@test.com',
        'blog',
        expect.any(String),
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

      await expect(
        rssService.deleteRssCertification(user, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('본인이 인증한 RSS가 아니면 ForbiddenException을 던진다.', async () => {
      rssAcceptRepository.findOne.mockResolvedValue({
        id: 1,
        userId: 99,
      } as any);

      await expect(
        rssService.deleteRssCertification(user, 1),
      ).rejects.toThrow(ForbiddenException);
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
