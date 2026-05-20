import { injectable } from 'tsyringe';

import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import logger from '@src/logger';

import {
  createDeleteAccountContent,
  createPasswordResetMailContent,
  createRssRegistrationContent,
  createRssRemoveCertificateContent,
  createVerificationMailContent,
  PRODUCT_DOMAIN,
} from '@email/email.content';

import { Rss, RssRegistration, RssRemoval, User } from '@app-types/types';

@injectable()
export class EmailService {
  private transporter: nodemailer.Transporter<
    SMTPTransport.SentMessageInfo,
    SMTPTransport.Options
  >;
  private emailUser: string;

  constructor() {
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
    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`${mailOptions.to as string} 이메일 전송 성공`);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(
          `${mailOptions.to as string} 이메일 전송 실패 - 오류 메시지: ${
            error.message
          }, 스택 트레이스: ${error.stack}`,
        );
      }
      throw error;
    }
  }

  async sendRssMail(rssRegistrationReuslt: RssRegistration): Promise<void> {
    const mailOptions = this.createRssRegistrationMail(
      rssRegistrationReuslt.rss,
      rssRegistrationReuslt.approveFlag,
      rssRegistrationReuslt.description,
    );

    await this.sendMail(mailOptions);
  }

  async sendUserCertificationMail(user: User): Promise<void> {
    const mailOptions = this.createCertificationMail(user);

    await this.sendMail(mailOptions);
  }

  private createCertificationMail(user: User): nodemailer.SendMailOptions {
    const redirectUrl = `${PRODUCT_DOMAIN}/user/certificate?token=${user.uuid}`;

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
    return {
      from: `Denamu<${this.emailUser}>`,
      to: `${userName}<${email}>`,
      subject: `[🎋 Denamu] RSS 삭제 신청 인증 메일입니다.`,
      html: createRssRemoveCertificateContent(
        userName,
        certificateCode,
        this.emailUser,
        rssUrl,
      ),
    };
  }

  async sendPasswordResetEmail(user: User): Promise<void> {
    const mailOptions = this.createPasswordResetEmail(user);

    await this.sendMail(mailOptions);
  }

  private createPasswordResetEmail(user: User): nodemailer.SendMailOptions {
    const redirectUrl = `${PRODUCT_DOMAIN}/user/password?token=${user.uuid}`;
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

  private createDeleteAccountMail(user: User): nodemailer.SendMailOptions {
    const redirectUrl = `${PRODUCT_DOMAIN}/user/delete-account?token=${user.uuid}`;

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
