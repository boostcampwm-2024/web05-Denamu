import 'reflect-metadata';

import * as nodemailer from 'nodemailer';

import { EmailMetrics } from '@common/metrics/email-metrics';
import { RssRegistration, RssRemoval, User } from '@common/types';

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
        `${PRODUCT_DOMAIN}/user/certificate?token=${user.uuid}`,
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
        `${PRODUCT_DOMAIN}/user/password?token=${user.uuid}`,
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
        `${PRODUCT_DOMAIN}/user/delete-account?token=${user.uuid}`,
      );
    });
  });
});
