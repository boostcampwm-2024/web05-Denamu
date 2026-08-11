import { inject, injectable } from 'tsyringe';

import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import logger from '@common/logger/logger';
import { EmailMetrics } from '@common/metrics/email-metrics';
import {
  AdminCertification,
  MarketingBroadcast,
  NoticePublished,
  QnaAnswered,
  Rss,
  RssCertification,
  RssRegistration,
  RssRegistrationRequest,
  RssRemoval,
  UnreadNotificationDigest,
  User,
} from '@common/types';

import {
  createAdminDeleteAccountContent,
  createAdminVerificationMailContent,
  createDeleteAccountContent,
  createMarketingBroadcastContent,
  createNoticePublishedContent,
  createPasswordResetMailContent,
  createQnaAnsweredContent,
  createRssCertificationContent,
  createRssRegistrationContent,
  createRssRegistrationRequestContent,
  createRssRemoveCertificateContent,
  createUnreadNotificationDigestContent,
  createVerificationMailContent,
  PRODUCT_DOMAIN,
} from '@email/email.content';

@injectable()
export class EmailService {
  private transporter: nodemailer.Transporter<
    SMTPTransport.SentMessageInfo,
    SMTPTransport.Options
  >;
  private emailUser: string;

  constructor(@inject(EmailMetrics) private readonly metrics: EmailMetrics) {
    this.emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;

    if (!this.emailUser) {
      throw new Error('EMAIL_USER 환경 변수가 설정되지 않았습니다.');
    }

    if (!emailPassword) {
      throw new Error('EMAIL_PASSWORD 환경 변수가 설정되지 않았습니다.');
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: this.emailUser,
        pass: emailPassword,
      },
    });
  }

  private async sendMail(
    mailOptions: nodemailer.SendMailOptions,
  ): Promise<void> {
    this.metrics.total.inc();
    try {
      await this.transporter.sendMail(mailOptions);
      this.metrics.success.inc();
      logger.info(`${mailOptions.to as string} 이메일 전송 성공`);
    } catch (error) {
      logger.error(
        `${mailOptions.to as string} 이메일 전송 실패 - 오류 메시지: ${
          error instanceof Error ? error.message : String(error)
        }, 스택 트레이스: ${error instanceof Error ? error.stack : ''}`,
      );
      throw error;
    }
  }

  async sendAdminCertificationMail(admin: AdminCertification): Promise<void> {
    const mailOptions = this.createAdminCertificationMail(admin);

    await this.sendMail(mailOptions);
  }

  private createAdminCertificationMail(
    admin: AdminCertification,
  ): nodemailer.SendMailOptions {
    const redirectUrl = `${PRODUCT_DOMAIN}/admins/email-verifications?token=${admin.uuid}`;

    return {
      from: `Denamu<${this.emailUser}>`,
      to: admin.email,
      subject: `[🎋 Denamu] 관리자 계정 인증 메일`,
      html: createAdminVerificationMailContent(
        admin.name,
        redirectUrl,
        this.emailUser,
      ),
    };
  }

  async sendAdminDeleteAccountMail(admin: AdminCertification): Promise<void> {
    const mailOptions = this.createAdminDeleteAccountMail(admin);

    await this.sendMail(mailOptions);
  }

  private createAdminDeleteAccountMail(
    admin: AdminCertification,
  ): nodemailer.SendMailOptions {
    const redirectUrl = `${PRODUCT_DOMAIN}/admins/deletion-requests/confirm?token=${admin.uuid}`;

    return {
      from: `Denamu<${this.emailUser}>`,
      to: admin.email,
      subject: `[🎋 Denamu] 관리자 회원탈퇴 확인 메일`,
      html: createAdminDeleteAccountContent(
        admin.name,
        redirectUrl,
        this.emailUser,
      ),
    };
  }

  async sendAdminPasswordResetEmail(admin: AdminCertification): Promise<void> {
    const mailOptions = this.createAdminPasswordResetMail(admin);

    await this.sendMail(mailOptions);
  }

  private createAdminPasswordResetMail(
    admin: AdminCertification,
  ): nodemailer.SendMailOptions {
    const redirectUrl = `${PRODUCT_DOMAIN}/admins/password-resets/confirm?token=${admin.uuid}`;

    return {
      from: `Denamu<${this.emailUser}>`,
      to: admin.email,
      subject: `[🎋 Denamu] 관리자 비밀번호 재설정`,
      html: createPasswordResetMailContent(
        admin.name,
        redirectUrl,
        this.emailUser,
      ),
    };
  }

  async sendRssMail(rssRegistrationReuslt: RssRegistration): Promise<void> {
    const mailOptions = this.createRssRegistrationMail(
      rssRegistrationReuslt.rss,
      rssRegistrationReuslt.approveFlag,
      rssRegistrationReuslt.description,
    );

    await this.sendMail(mailOptions);
  }

  async sendRssRegistrationRequestMail(
    rssRegistrationRequest: RssRegistrationRequest,
  ): Promise<void> {
    const mailOptions = this.createRssRegistrationRequestMail(
      rssRegistrationRequest.rss,
      rssRegistrationRequest.adminEmail,
    );

    await this.sendMail(mailOptions);
  }

  private createRssRegistrationRequestMail(
    rss: Rss,
    adminEmail: string,
  ): nodemailer.SendMailOptions {
    return {
      from: `Denamu<${this.emailUser}>`,
      to: adminEmail,
      subject: `[🎋 Denamu] 새로운 RSS 등록 신청이 접수되었습니다.`,
      html: createRssRegistrationRequestContent(rss, this.emailUser),
    };
  }

  async sendUserCertificationMail(user: User): Promise<void> {
    const mailOptions = this.createCertificationMail(user);

    await this.sendMail(mailOptions);
  }

  private createCertificationMail(user: User): nodemailer.SendMailOptions {
    const redirectUrl = `${PRODUCT_DOMAIN}/users/email-verifications?token=${user.uuid}`;

    return {
      from: `Denamu<${this.emailUser}>`,
      to: user.email,
      subject: `[🎋 Denamu] 회원가입 인증 메일`,
      html: createVerificationMailContent(
        user.userName,
        redirectUrl,
        this.emailUser,
      ),
    };
  }

  private createRssRegistrationMail(
    rss: Rss,
    approveFlag: boolean,
    description?: string,
  ): nodemailer.SendMailOptions {
    const result = approveFlag ? '승인' : '거부';
    return {
      from: `Denamu<${this.emailUser}>`,
      to: `${rss.userName}<${rss.email}>`,
      subject: `[🎋 Denamu] RSS 등록이 ${result} 되었습니다.`,
      html: createRssRegistrationContent(
        rss,
        approveFlag,
        this.emailUser,
        description,
      ),
    };
  }

  async sendRssRemoveCertificationMail(rssRemoveCertification: RssRemoval) {
    const mailOption = this.createRssRemoveCertificationMail(
      rssRemoveCertification.userName,
      rssRemoveCertification.email,
      rssRemoveCertification.rssUrl,
      rssRemoveCertification.certificateCode,
    );
    await this.sendMail(mailOption);
  }

  private createRssRemoveCertificationMail(
    userName: string,
    email: string,
    rssUrl: string,
    certificateCode: string,
  ) {
    const removalLink = `${PRODUCT_DOMAIN}/rss/removals/confirm?code=${certificateCode}`;

    return {
      from: `Denamu<${this.emailUser}>`,
      to: `${userName}<${email}>`,
      subject: `[🎋 Denamu] RSS 삭제 신청 인증 메일입니다.`,
      html: createRssRemoveCertificateContent(
        userName,
        this.emailUser,
        rssUrl,
        removalLink,
      ),
    };
  }

  async sendRssCertificationMail(rssCertification: RssCertification) {
    const mailOption = this.createRssCertificationMail(
      rssCertification.userName,
      rssCertification.email,
      rssCertification.blogName,
      rssCertification.certificateCode,
      rssCertification.userEmail,
    );
    await this.sendMail(mailOption);
  }

  private createRssCertificationMail(
    userName: string,
    email: string,
    blogName: string,
    certificateCode: string,
    userEmail: string,
  ) {
    const certificationLink = `${PRODUCT_DOMAIN}/rss/certifications/confirm?code=${certificateCode}`;
    return {
      from: `Denamu<${this.emailUser}>`,
      to: `${userName}<${email}>`,
      subject: `[🎋 Denamu] RSS 소유 인증 메일입니다.`,
      html: createRssCertificationContent(
        userName,
        this.emailUser,
        blogName,
        userEmail,
        certificationLink,
      ),
    };
  }

  async sendPasswordResetEmail(user: User): Promise<void> {
    const mailOptions = this.createPasswordResetEmail(user);

    await this.sendMail(mailOptions);
  }

  private createPasswordResetEmail(user: User): nodemailer.SendMailOptions {
    const redirectUrl = `${PRODUCT_DOMAIN}/users/password-resets/confirm?token=${user.uuid}`;
    return {
      from: `Denamu<${this.emailUser}>`,
      to: user.email,
      subject: `[🎋 Denamu] 비밀번호 재설정`,
      html: createPasswordResetMailContent(
        user.userName,
        redirectUrl,
        this.emailUser,
      ),
    };
  }

  async sendDeleteAccountMail(user: User): Promise<void> {
    const mailOptions = this.createDeleteAccountMail(user);

    await this.sendMail(mailOptions);
  }

  async sendQnaAnsweredMail(qnaAnswered: QnaAnswered): Promise<void> {
    const mailOptions = this.createQnaAnsweredMail(qnaAnswered);

    await this.sendMail(mailOptions);
  }

  private createQnaAnsweredMail(
    qnaAnswered: QnaAnswered,
  ): nodemailer.SendMailOptions {
    return {
      from: `Denamu<${this.emailUser}>`,
      to: qnaAnswered.email,
      subject: `[🎋 Denamu] 문의하신 Q&A에 답변이 등록되었습니다.`,
      html: createQnaAnsweredContent(
        qnaAnswered.recipientName,
        qnaAnswered.qnaTitle,
        qnaAnswered.qnaId,
        this.emailUser,
      ),
    };
  }

  async sendNoticePublishedMail(notice: NoticePublished): Promise<void> {
    const mailOptions = this.createNoticePublishedMail(notice);

    await this.sendMail(mailOptions);
  }

  private createNoticePublishedMail(
    notice: NoticePublished,
  ): nodemailer.SendMailOptions {
    return {
      from: `Denamu<${this.emailUser}>`,
      to: `${notice.userName}<${notice.email}>`,
      subject: `[🎋 Denamu] 새로운 공지사항이 등록되었습니다.`,
      html: createNoticePublishedContent(
        notice.userName,
        notice.title,
        notice.boardId,
        this.emailUser,
      ),
    };
  }

  async sendMarketingBroadcastMail(
    marketingBroadcast: MarketingBroadcast,
  ): Promise<void> {
    const mailOptions = this.createMarketingBroadcastMail(marketingBroadcast);

    await this.sendMail(mailOptions);
  }

  async sendUnreadNotificationDigestMail(
    digest: UnreadNotificationDigest,
  ): Promise<void> {
    const mailOptions = this.createUnreadNotificationDigestMail(digest);

    await this.sendMail(mailOptions);
  }

  private createMarketingBroadcastMail(
    marketingBroadcast: MarketingBroadcast,
  ): nodemailer.SendMailOptions {
    return {
      from: `Denamu<${this.emailUser}>`,
      to: `${marketingBroadcast.userName}<${marketingBroadcast.email}>`,
      subject: `(광고) [🎋 Denamu] ${marketingBroadcast.subject}`,
      html: createMarketingBroadcastContent(
        marketingBroadcast.userName,
        marketingBroadcast.content,
        this.emailUser,
      ),
    };
  }

  private createUnreadNotificationDigestMail(
    digest: UnreadNotificationDigest,
  ): nodemailer.SendMailOptions {
    return {
      from: `Denamu<${this.emailUser}>`,
      to: `${digest.userName}<${digest.email}>`,
      subject: `[🎋 Denamu] 확인하지 않은 알림이 ${digest.unreadCount}개 있습니다.`,
      html: createUnreadNotificationDigestContent(
        digest.userName,
        digest.unreadCount,
        this.emailUser,
      ),
    };
  }

  private createDeleteAccountMail(user: User): nodemailer.SendMailOptions {
    const redirectUrl = `${PRODUCT_DOMAIN}/users/deletion-requests/confirm?token=${user.uuid}`;

    return {
      from: `Denamu<${this.emailUser}>`,
      to: user.email,
      subject: `[🎋 Denamu] 회원탈퇴 확인 메일`,
      html: createDeleteAccountContent(
        user.userName,
        redirectUrl,
        this.emailUser,
      ),
    };
  }
}
