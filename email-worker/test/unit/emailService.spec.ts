import 'reflect-metadata';

import * as nodemailer from 'nodemailer';

import { EmailMetrics } from '@common/metrics/email-metrics';
import {
  AdminCertification,
  MarketingBroadcast,
  NoticePublished,
  RssCertification,
  RssRegistration,
  RssRegistrationRequest,
  RssRemoval,
  User,
} from '@common/types';

import { PRODUCT_DOMAIN } from '@email/email.content';
import { EmailService } from '@email/email.service';

jest.mock('nodemailer');

const mockEmailMetrics = {
  total: { inc: jest.fn() },
  success: { inc: jest.fn() },
  startMetricsServer: jest.fn(),
} as unknown as EmailMetrics;

describe('EmailService unit test', () => {
  let emailService: EmailService;
  let mockSendMail: jest.Mock;
  const mockEmailUser = 'test@denamu.dev';
  const mockEmailPassword = 'test-password';
  let originalSmtpHost: string | undefined;
  let originalSmtpPort: string | undefined;

  beforeEach(() => {
    originalSmtpHost = process.env.SMTP_HOST;
    originalSmtpPort = process.env.SMTP_PORT;
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    process.env.EMAIL_USER = mockEmailUser;
    process.env.EMAIL_PASSWORD = mockEmailPassword;

    mockSendMail = jest
      .fn()
      .mockResolvedValue({ messageId: 'test-message-id' });

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });

    emailService = new EmailService(mockEmailMetrics);
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASSWORD;
    if (originalSmtpHost !== undefined) {
      process.env.SMTP_HOST = originalSmtpHost;
    }
    if (originalSmtpPort !== undefined) {
      process.env.SMTP_PORT = originalSmtpPort;
    }
  });

  describe('EmailService 생성자 unit test', () => {
    it('EMAIL_USER 환경 변수가 없으면 에러를 던진다', () => {
      delete process.env.EMAIL_USER;

      expect(() => new EmailService(mockEmailMetrics)).toThrow(
        'EMAIL_USER 환경 변수가 설정되지 않았습니다.',
      );
    });

    it('EMAIL_PASSWORD 환경 변수가 없으면 에러를 던진다', () => {
      delete process.env.EMAIL_PASSWORD;

      expect(() => new EmailService(mockEmailMetrics)).toThrow(
        'EMAIL_PASSWORD 환경 변수가 설정되지 않았습니다.',
      );
    });

    it('올바른 설정으로 nodemailer transporter를 생성한다', () => {
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: mockEmailUser,
          pass: mockEmailPassword,
        },
      });
    });

    it('SMTP_HOST, SMTP_PORT 환경 변수가 있으면 해당 값으로 transporter를 생성한다', () => {
      process.env.SMTP_HOST = 'smtp.custom.com';
      process.env.SMTP_PORT = '2525';
      (nodemailer.createTransport as jest.Mock).mockClear();

      new EmailService(mockEmailMetrics);

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.custom.com',
        port: 2525,
        secure: false,
        auth: {
          user: mockEmailUser,
          pass: mockEmailPassword,
        },
      });
    });
  });

  describe('sendUserCertificationMail unit test', () => {
    it('회원가입 인증 메일을 올바르게 전송한다', async () => {
      const user: User = {
        email: 'user@test.com',
        userName: 'testUser',
        uuid: 'test-uuid',
      };

      await emailService.sendUserCertificationMail(user);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: `Denamu<${mockEmailUser}>`,
          to: user.email,
          subject: '[🎋 Denamu] 회원가입 인증 메일',
        }),
      );

      const callArgs = (mockSendMail.mock.calls[0] as [{ html: string }])[0];
      expect(callArgs.html).toContain(user.userName);
      expect(callArgs.html).toContain(
        `${PRODUCT_DOMAIN}/users/email-verifications?token=${user.uuid}`,
      );
    });

    it('메일 전송 실패 시 에러를 던진다', async () => {
      const user: User = {
        email: 'user@test.com',
        userName: 'testUser',
        uuid: 'test-uuid',
      };
      const error = new Error('SMTP connection failed');
      mockSendMail.mockRejectedValue(error);

      await expect(
        emailService.sendUserCertificationMail(user),
      ).rejects.toThrow('SMTP connection failed');
    });

    it('Error 인스턴스가 아닌 값으로 실패해도 그대로 전파한다', async () => {
      const user: User = {
        email: 'user@test.com',
        userName: 'testUser',
        uuid: 'test-uuid',
      };
      mockSendMail.mockRejectedValue('non-error failure');

      await expect(emailService.sendUserCertificationMail(user)).rejects.toBe(
        'non-error failure',
      );
    });
  });

  describe('sendRssMail unit test', () => {
    it('RSS 등록 승인 메일을 올바르게 전송한다', async () => {
      const rssRegistration: RssRegistration = {
        rss: {
          name: 'Test Blog',
          userName: 'tester',
          email: 'tester@test.com',
          rssUrl: 'https://test.com/rss',
        },
        approveFlag: true,
        description: undefined,
      };

      await emailService.sendRssMail(rssRegistration);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: `Denamu<${mockEmailUser}>`,
          to: `${rssRegistration.rss.userName}<${rssRegistration.rss.email}>`,
          subject: '[🎋 Denamu] RSS 등록이 승인 되었습니다.',
        }),
      );

      const callArgs = (mockSendMail.mock.calls[0] as [{ html: string }])[0];
      expect(callArgs.html).toContain(rssRegistration.rss.name);
      expect(callArgs.html).toContain(rssRegistration.rss.rssUrl);
    });

    it('RSS 등록 거부 메일을 올바르게 전송한다', async () => {
      const rssRegistration: RssRegistration = {
        rss: {
          name: 'Test Blog',
          userName: 'tester',
          email: 'tester@test.com',
          rssUrl: 'https://test.com/rss',
        },
        approveFlag: false,
        description: 'RSS 형식이 올바르지 않습니다.',
      };

      await emailService.sendRssMail(rssRegistration);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: '[🎋 Denamu] RSS 등록이 거부 되었습니다.',
        }),
      );

      const callArgs = (mockSendMail.mock.calls[0] as [{ html: string }])[0];
      expect(callArgs.html).toContain(rssRegistration.description);
    });
  });

  describe('sendRssRemoveCertificationMail unit test', () => {
    it('RSS 삭제 인증 메일을 올바르게 전송한다', async () => {
      const rssRemoval: RssRemoval = {
        userName: 'tester',
        email: 'tester@test.com',
        rssUrl: 'https://test.com/rss',
        certificateCode: 'test-uuid',
      };

      await emailService.sendRssRemoveCertificationMail(rssRemoval);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: `Denamu<${mockEmailUser}>`,
          to: `${rssRemoval.userName}<${rssRemoval.email}>`,
          subject: '[🎋 Denamu] RSS 삭제 신청 인증 메일입니다.',
        }),
      );

      const callArgs = (mockSendMail.mock.calls[0] as [{ html: string }])[0];
      expect(callArgs.html).toContain(rssRemoval.userName);
      expect(callArgs.html).toContain(rssRemoval.certificateCode);
      expect(callArgs.html).toContain(rssRemoval.rssUrl);
      expect(callArgs.html).toContain(
        `/rss/removals/confirm?code=${rssRemoval.certificateCode}`,
      );
    });
  });

  describe('sendRssCertificationMail unit test', () => {
    it('RSS 소유 인증 메일을 올바르게 전송한다', async () => {
      const rssCertification: RssCertification = {
        userName: 'tester',
        email: 'tester@test.com',
        blogName: 'Test Blog',
        certificateCode: 'cert-uuid',
        userEmail: 'requester@test.com',
      };

      await emailService.sendRssCertificationMail(rssCertification);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: `Denamu<${mockEmailUser}>`,
          to: `${rssCertification.userName}<${rssCertification.email}>`,
          subject: '[🎋 Denamu] RSS 소유 인증 메일입니다.',
        }),
      );

      const callArgs = (mockSendMail.mock.calls[0] as [{ html: string }])[0];
      expect(callArgs.html).toContain(rssCertification.userName);
      expect(callArgs.html).toContain(rssCertification.certificateCode);
      expect(callArgs.html).toContain(rssCertification.blogName);
      expect(callArgs.html).toContain(rssCertification.userEmail);
      expect(callArgs.html).toContain(
        `/rss/certifications/confirm?code=${rssCertification.certificateCode}`,
      );
    });
  });

  describe('sendPasswordResetEmail unit test', () => {
    it('비밀번호 재설정 메일을 올바르게 전송한다', async () => {
      const user: User = {
        email: 'tester@test.com',
        userName: 'tester',
        uuid: 'test-uuid',
      };

      await emailService.sendPasswordResetEmail(user);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: `Denamu<${mockEmailUser}>`,
          to: user.email,
          subject: '[🎋 Denamu] 비밀번호 재설정',
        }),
      );

      const callArgs = (mockSendMail.mock.calls[0] as [{ html: string }])[0];
      expect(callArgs.html).toContain(user.userName);
      expect(callArgs.html).toContain(
        `${PRODUCT_DOMAIN}/users/password-resets/confirm?token=${user.uuid}`,
      );
    });
  });

  describe('sendDeleteAccountMail unit test', () => {
    it('회원탈퇴 확인 메일을 올바르게 전송한다', async () => {
      const user: User = {
        email: 'tester@test.com',
        userName: 'tester',
        uuid: 'test-uuid',
      };

      await emailService.sendDeleteAccountMail(user);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: `Denamu<${mockEmailUser}>`,
          to: user.email,
          subject: '[🎋 Denamu] 회원탈퇴 확인 메일',
        }),
      );

      const callArgs = (mockSendMail.mock.calls[0] as [{ html: string }])[0];
      expect(callArgs.html).toContain(user.userName);
      expect(callArgs.html).toContain(
        `${PRODUCT_DOMAIN}/users/deletion-requests/confirm?token=${user.uuid}`,
      );
    });
  });

  describe('sendAdminCertificationMail unit test', () => {
    it('관리자 계정 인증 메일을 올바르게 전송한다', async () => {
      const admin: AdminCertification = {
        email: 'admin@test.com',
        name: 'adminUser',
        uuid: 'admin-uuid',
      };

      await emailService.sendAdminCertificationMail(admin);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: `Denamu<${mockEmailUser}>`,
          to: admin.email,
          subject: '[🎋 Denamu] 관리자 계정 인증 메일',
        }),
      );

      const callArgs = (mockSendMail.mock.calls[0] as [{ html: string }])[0];
      expect(callArgs.html).toContain(admin.name);
      expect(callArgs.html).toContain(
        `${PRODUCT_DOMAIN}/admins/email-verifications?token=${admin.uuid}`,
      );
    });
  });

  describe('sendAdminDeleteAccountMail unit test', () => {
    it('관리자 회원탈퇴 확인 메일을 올바르게 전송한다', async () => {
      const admin: AdminCertification = {
        email: 'admin@test.com',
        name: 'adminUser',
        uuid: 'admin-uuid',
      };

      await emailService.sendAdminDeleteAccountMail(admin);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: `Denamu<${mockEmailUser}>`,
          to: admin.email,
          subject: '[🎋 Denamu] 관리자 회원탈퇴 확인 메일',
        }),
      );

      const callArgs = (mockSendMail.mock.calls[0] as [{ html: string }])[0];
      expect(callArgs.html).toContain(admin.name);
      expect(callArgs.html).toContain(
        `${PRODUCT_DOMAIN}/admins/deletion-requests/confirm?token=${admin.uuid}`,
      );
    });
  });

  describe('sendAdminPasswordResetEmail unit test', () => {
    it('관리자 비밀번호 재설정 메일을 올바르게 전송한다', async () => {
      const admin: AdminCertification = {
        email: 'admin@test.com',
        name: 'adminUser',
        uuid: 'admin-uuid',
      };

      await emailService.sendAdminPasswordResetEmail(admin);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: `Denamu<${mockEmailUser}>`,
          to: admin.email,
          subject: '[🎋 Denamu] 관리자 비밀번호 재설정',
        }),
      );

      const callArgs = (mockSendMail.mock.calls[0] as [{ html: string }])[0];
      expect(callArgs.html).toContain(admin.name);
      expect(callArgs.html).toContain(
        `${PRODUCT_DOMAIN}/admins/password-resets/confirm?token=${admin.uuid}`,
      );
    });
  });

  describe('sendRssRegistrationRequestMail unit test', () => {
    it('RSS 등록 신청 접수 메일을 관리자에게 올바르게 전송한다', async () => {
      const request: RssRegistrationRequest = {
        rss: {
          name: 'Test Blog',
          userName: 'tester',
          email: 'tester@test.com',
          rssUrl: 'https://test.com/rss',
        },
        adminEmail: 'admin@test.com',
      };

      await emailService.sendRssRegistrationRequestMail(request);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: `Denamu<${mockEmailUser}>`,
          to: request.adminEmail,
          subject: '[🎋 Denamu] 새로운 RSS 등록 신청이 접수되었습니다.',
        }),
      );

      const callArgs = (mockSendMail.mock.calls[0] as [{ html: string }])[0];
      expect(callArgs.html).toContain(request.rss.name);
      expect(callArgs.html).toContain(request.rss.rssUrl);
    });
  });

  describe('sendNoticePublishedMail unit test', () => {
    it('공지사항 등록 메일을 공지 수신동의 안내와 함께 올바르게 전송한다', async () => {
      //given
      const notice: NoticePublished = {
        email: 'tester@test.com',
        userName: 'tester',
        boardId: 42,
        title: '서비스 점검 안내',
      };

      //when
      await emailService.sendNoticePublishedMail(notice);

      //then
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: `Denamu<${mockEmailUser}>`,
          to: `${notice.userName}<${notice.email}>`,
          subject: '[🎋 Denamu] 새로운 공지사항이 등록되었습니다.',
        }),
      );

      const callArgs = (mockSendMail.mock.calls[0] as [{ html: string }])[0];
      expect(callArgs.html).toContain(notice.userName);
      expect(callArgs.html).toContain(notice.title);
      expect(callArgs.html).toContain(
        `${PRODUCT_DOMAIN}/board/${notice.boardId}`,
      );
      expect(callArgs.html).toContain('공지사항 이메일 수신 동의');
      expect(callArgs.html).not.toContain(
        '마케팅 활용 및 광고성 정보 수신 동의',
      );
    });
  });

  describe('sendMarketingBroadcastMail unit test', () => {
    const marketingBroadcast: MarketingBroadcast = {
      email: 'tester@test.com',
      userName: 'tester',
      subject: '9월 신규 기능 소식',
      content: '<p>이번 달 업데이트를 확인해보세요.</p>',
    };

    it('광고성 단체 메일을 (광고) 접두사가 붙은 제목으로 전송한다', async () => {
      //given
      const expectedSubject = `(광고) [🎋 Denamu] ${marketingBroadcast.subject}`;

      //when
      await emailService.sendMarketingBroadcastMail(marketingBroadcast);

      //then
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: `Denamu<${mockEmailUser}>`,
          to: `${marketingBroadcast.userName}<${marketingBroadcast.email}>`,
          subject: expectedSubject,
        }),
      );
    });

    it('본문에 수신자 이름, 전달 내용, 마케팅 수신동의 안내가 포함된다', async () => {
      //given
      //when
      await emailService.sendMarketingBroadcastMail(marketingBroadcast);

      //then
      const callArgs = (mockSendMail.mock.calls[0] as [{ html: string }])[0];
      expect(callArgs.html).toContain(marketingBroadcast.userName);
      expect(callArgs.html).toContain(marketingBroadcast.content);
      expect(callArgs.html).toContain('마케팅 활용 및 광고성 정보 수신 동의');
      expect(callArgs.html).not.toContain('공지사항 이메일 수신 동의');
    });

    it('메일 전송 실패 시 에러를 그대로 전파한다', async () => {
      //given
      const error = new Error('SMTP connection failed');
      mockSendMail.mockRejectedValue(error);

      //when
      const sending =
        emailService.sendMarketingBroadcastMail(marketingBroadcast);

      //then
      await expect(sending).rejects.toThrow('SMTP connection failed');
    });
  });
});
