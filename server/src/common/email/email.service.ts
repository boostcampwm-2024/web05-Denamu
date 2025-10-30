import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { WinstonLoggerService } from '../logger/logger.service';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import {
  createPasswordResetMailContent,
  createRssRegistrationContent,
  createRssRemoveCertificateContent,
  createVerificationMailContent,
  createDeleteAccountContent,
  PRODUCT_DOMAIN,
} from './mailContent';
import { Rss } from '../../rss/entity/rss.entity';
import { User } from '../../user/entity/user.entity';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter<
    SMTPTransport.SentMessageInfo,
    SMTPTransport.Options
  >;
  private emailUser: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: WinstonLoggerService,
  ) {
    this.emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPassword = this.configService.get<string>('EMAIL_PASSWORD');
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
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
      this.logger.log(`${mailOptions.to} 이메일 전송 성공`);
    } catch (error) {
      this.logger.error(`${mailOptions.to} 이메일 전송 실패: ${error}`);
    }
  }

  async sendRssMail(
    rss: Rss,
    approveFlag: boolean,
    description?: string,
  ): Promise<void> {
    const mailOptions = this.createRssRegistrationMail(
      rss,
      approveFlag,
      description,
    );

    await this.sendMail(mailOptions);
  }

  async sendUserCertificationMail(user: User, uuid: string): Promise<void> {
    const mailOptions = this.createCertificationMail(user, uuid);

    await this.sendMail(mailOptions);
  }

  private createCertificationMail(
    user: User,
    uuid: string,
  ): nodemailer.SendMailOptions {
    const redirectUrl = `${PRODUCT_DOMAIN}/user/certificate?token=${uuid}`;

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

  async sendRssRemoveCertificationMail(
    userName: string,
    email: string,
    rssUrl: string,
    certificateCode: string,
  ) {
    const mailOption = this.createRssRemoveCertificationMail(
      userName,
      email,
      rssUrl,
      certificateCode,
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

  async sendPasswordResetEmail(user: User, uuid: string): Promise<void> {
    const mailOptions = this.createPasswordResetEmail(user, uuid);

    await this.sendMail(mailOptions);
  }

  private createPasswordResetEmail(
    user: User,
    uuid: string,
  ): nodemailer.SendMailOptions {
    const redirectUrl = `${PRODUCT_DOMAIN}/user/password?token=${uuid}`;
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

  async sendDeleteAccountMail(user: User, token: string): Promise<void> {
    const mailOptions = this.createDeleteAccountMail(user, token);

    await this.sendMail(mailOptions);
  }

  private createDeleteAccountMail(
    user: User,
    token: string,
  ): nodemailer.SendMailOptions {
    const redirectUrl = `${PRODUCT_DOMAIN}/user/delete-account?token=${token}`;

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
