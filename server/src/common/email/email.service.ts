import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { WinstonLoggerService } from '../logger/logger.service';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { createMailContent } from './mail_content';
import { Rss } from '../../rss/entity/rss.entity';

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
      html: createMailContent(rss, approveFlag, this.emailUser, description),
    };
  }
}
