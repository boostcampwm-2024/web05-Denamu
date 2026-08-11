import { AdminRepository } from '@admin/repository/admin.repository';

import { EmailProducer } from '@common/email/email.producer';
import { WinstonLoggerService } from '@common/logger/logger.service';

import { GetAdminMarketingEmailsRequestDto } from '@marketingEmail/dto/request/getAdminMarketingEmails.dto';
import { SendMarketingEmailRequestDto } from '@marketingEmail/dto/request/sendMarketingEmail.dto';
import { MarketingEmail } from '@marketingEmail/entity/marketingEmail.entity';
import { MarketingEmailRepository } from '@marketingEmail/repository/marketingEmail.repository';
import { MarketingEmailService } from '@marketingEmail/service/marketingEmail.service';

import { UserRepository } from '@user/repository/user.repository';

import { MarketingEmailFixture } from '@test/config/common/fixture/marketingEmail.fixture';

describe(`${MarketingEmailService.name} Unit Test`, () => {
  let marketingEmailService: MarketingEmailService;
  let marketingEmailRepository: Record<
    'findAdminList' | 'create' | 'save' | 'findOne',
    jest.Mock
  >;
  let adminRepository: Record<'findOneBy', jest.Mock>;
  let userRepository: jest.Mocked<
    Pick<UserRepository, 'findMarketingAgreedUsers'>
  >;
  let emailProducer: jest.Mocked<
    Pick<EmailProducer, 'produceMarketingBroadcast'>
  >;
  let logger: jest.Mocked<Pick<WinstonLoggerService, 'error'>>;

  const createMarketingEmail = (
    overwrites: Partial<MarketingEmail> = {},
  ): MarketingEmail =>
    MarketingEmailFixture.createMarketingEmailFixture({
      id: 1,
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      ...overwrites,
    });

  beforeEach(() => {
    marketingEmailRepository = {
      findAdminList: jest.fn(),
      create: jest.fn((entityLike) => entityLike),
      save: jest.fn((entity) => entity),
      findOne: jest.fn(),
    };
    adminRepository = {
      findOneBy: jest.fn(),
    };
    userRepository = {
      findMarketingAgreedUsers: jest.fn().mockResolvedValue([]),
    };
    emailProducer = {
      produceMarketingBroadcast: jest.fn().mockResolvedValue(undefined),
    };
    logger = { error: jest.fn() };

    marketingEmailService = new MarketingEmailService(
      marketingEmailRepository as unknown as MarketingEmailRepository,
      adminRepository as unknown as AdminRepository,
      userRepository as unknown as UserRepository,
      emailProducer as unknown as EmailProducer,
      logger as unknown as WinstonLoggerService,
    );
  });

  describe('getAdminMarketingEmails', () => {
    it('페이지네이션 값을 리포지토리에 위임하고 목록을 반환한다.', async () => {
      // given
      marketingEmailRepository.findAdminList.mockResolvedValue({
        items: [createMarketingEmail({ id: 2 }), createMarketingEmail()],
        totalCount: 25,
      });

      // when
      const result = await marketingEmailService.getAdminMarketingEmails(
        new GetAdminMarketingEmailsRequestDto({ page: 2, limit: 10 }),
      );

      // then
      expect(marketingEmailRepository.findAdminList).toHaveBeenCalledWith(
        2,
        10,
      );
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.totalCount).toBe(25);
      expect(result.hasMore).toBe(true);
      expect(result.result).toHaveLength(2);
    });

    it('마지막 페이지일 경우 hasMore가 false로 반환된다.', async () => {
      // given
      marketingEmailRepository.findAdminList.mockResolvedValue({
        items: [createMarketingEmail()],
        totalCount: 10,
      });

      // when
      const result = await marketingEmailService.getAdminMarketingEmails(
        new GetAdminMarketingEmailsRequestDto({ page: 1, limit: 10 }),
      );

      // then
      expect(result.hasMore).toBe(false);
    });

    it('목록 응답에는 본문이 포함되지 않는다.', async () => {
      // given
      marketingEmailRepository.findAdminList.mockResolvedValue({
        items: [createMarketingEmail()],
        totalCount: 1,
      });

      // when
      const result = await marketingEmailService.getAdminMarketingEmails(
        new GetAdminMarketingEmailsRequestDto({ page: 1, limit: 10 }),
      );

      // then
      expect(result.result[0]).not.toHaveProperty('content');
    });

    it('발송한 관리자가 없는 이력일 경우 관리자 이름을 null로 반환한다.', async () => {
      // given
      marketingEmailRepository.findAdminList.mockResolvedValue({
        items: [createMarketingEmail({ author: null })],
        totalCount: 1,
      });

      // when
      const result = await marketingEmailService.getAdminMarketingEmails(
        new GetAdminMarketingEmailsRequestDto({ page: 1, limit: 10 }),
      );

      // then
      expect(result.result[0].authorName).toBeNull();
    });
  });

  describe('getAdminMarketingEmail', () => {
    it('id로 조회된 발송 이력을 본문 포함하여 반환한다.', async () => {
      // given
      marketingEmailRepository.findOne.mockResolvedValue(
        createMarketingEmail({ id: 5 }),
      );

      // when
      const result = await marketingEmailService.getAdminMarketingEmail(5);

      // then
      expect(marketingEmailRepository.findOne).toHaveBeenCalledWith({
        where: { id: 5 },
        relations: ['author'],
      });
      expect(result).toHaveProperty('content');
      expect(result.id).toBe(5);
    });

    it('존재하지 않는 id일 경우 NotFoundException을 던진다.', async () => {
      // given
      marketingEmailRepository.findOne.mockResolvedValue(null);

      // when, then
      await expect(
        marketingEmailService.getAdminMarketingEmail(999),
      ).rejects.toThrow('존재하지 않는 발송 이력입니다.');
    });
  });

  describe('sendMarketingEmail', () => {
    const requestDto = new SendMarketingEmailRequestDto({
      subject: '8월 소식',
      content: '<p>본문</p>',
    });

    it('수신 동의한 사용자 수를 수신자 수로 저장하고 각 사용자에게 이메일을 발행한다.', async () => {
      // given
      const author = { id: 1, name: '관리자', email: 'admin@test.com' };
      adminRepository.findOneBy.mockResolvedValue(author);
      userRepository.findMarketingAgreedUsers.mockResolvedValue([
        { email: 'a@test.com', userName: 'a' },
        { email: 'b@test.com', userName: 'b' },
      ] as any);

      // when
      const result = await marketingEmailService.sendMarketingEmail(
        'admin@test.com',
        requestDto,
      );

      // then
      expect(adminRepository.findOneBy).toHaveBeenCalledWith({
        email: 'admin@test.com',
      });
      expect(marketingEmailRepository.create).toHaveBeenCalledWith({
        subject: '8월 소식',
        content: '<p>본문</p>',
        recipientCount: 2,
        author,
      });
      expect(marketingEmailRepository.save).toHaveBeenCalled();
      expect(emailProducer.produceMarketingBroadcast).toHaveBeenCalledTimes(2);
      expect(emailProducer.produceMarketingBroadcast).toHaveBeenCalledWith({
        email: 'a@test.com',
        userName: 'a',
        subject: '8월 소식',
        content: '<p>본문</p>',
      });
      expect(result.recipientCount).toBe(2);
      expect(result.authorName).toBe('관리자');
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('수신 동의한 사용자가 없을 경우 수신자 수 0으로 저장하고 이메일을 발행하지 않는다.', async () => {
      // given
      adminRepository.findOneBy.mockResolvedValue(null);

      // when
      const result = await marketingEmailService.sendMarketingEmail(
        'admin@test.com',
        requestDto,
      );

      // then
      expect(emailProducer.produceMarketingBroadcast).not.toHaveBeenCalled();
      expect(result.recipientCount).toBe(0);
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('발송한 관리자를 찾지 못할 경우 관리자 이름을 null로 반환한다.', async () => {
      // given
      adminRepository.findOneBy.mockResolvedValue(null);

      // when
      const result = await marketingEmailService.sendMarketingEmail(
        'admin@test.com',
        requestDto,
      );

      // then
      expect(marketingEmailRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ author: null }),
      );
      expect(result.authorName).toBeNull();
    });

    it('일부 이메일 발행이 실패해도 에러를 기록하고 발송 결과를 반환한다.', async () => {
      // given
      adminRepository.findOneBy.mockResolvedValue(null);
      marketingEmailRepository.save.mockImplementation(
        (entity: MarketingEmail) => {
          entity.id = 1;
          return entity;
        },
      );
      userRepository.findMarketingAgreedUsers.mockResolvedValue([
        { email: 'a@test.com', userName: 'a' },
        { email: 'b@test.com', userName: 'b' },
      ] as any);
      emailProducer.produceMarketingBroadcast
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('RabbitMQ 오류'));

      // when
      const result = await marketingEmailService.sendMarketingEmail(
        'admin@test.com',
        requestDto,
      );

      // then
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('marketingEmailId=1, failed=1/2'),
      );
      expect(result.id).toBe(1);
      expect(result.recipientCount).toBe(2);
    });
  });
});
