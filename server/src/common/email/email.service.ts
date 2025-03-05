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

  async sendMail(rss: Rss, approveFlag: boolean, description?: string) {
    try {
      const { subject, content } = this.createEmail(
        rss,
        approveFlag,
        description,
      );
      await this.transporter.sendMail({
        from: `Denamu<${this.emailUser}>`,
        to: `${rss.userName}<${rss.email}>`,
        subject,
        html: content,
      });
      this.logger.log(`${rss.email} 주소로 메일이 전송되었습니다`);
    } catch (error) {
      this.logger.error(
        `${rss.email} 주소로 메일 전송 중 오류가 발생했습니다: ${error}`,
      );
    }
  }

  private createEmail(rss: Rss, approveFlag: boolean, description?: string) {
    const result = approveFlag ? `승인` : `거부`;
    const mail = {
      subject: `[🎋 Denamu] RSS 등록이 ${result} 되었습니다.`,
      content: createMailContent(rss, approveFlag, this.emailUser, description),
    };
    return mail;
  }
}
