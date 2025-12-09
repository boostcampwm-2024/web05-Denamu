import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { WinstonLoggerService } from '../logger/logger.service';
import { RMQ_EXCHANGES, RMQ_ROUTING_KEYS } from '../rabbitmq/rabbitmq.constant';
import { EmailPayload, EmailPayloadConstant } from './email.type';
import { User } from '../../user/entity/user.entity';
import { Rss } from '../../rss/entity/rss.entity';

@Injectable()
export class EmailProducer {
  constructor(
    private readonly rabbitmqService: RabbitMQService,
    private readonly logger: WinstonLoggerService,
  ) {}

  private async produceMessage(payload: EmailPayload): Promise<void> {
    const stringifiedMessage = JSON.stringify(payload);
    await this.rabbitmqService.sendMessage(
      RMQ_EXCHANGES.EMAIL,
      RMQ_ROUTING_KEYS.EMAIL_SEND,
      stringifiedMessage,
    );

    const email =
      payload.type === EmailPayloadConstant.RSS_REGISTRATION
        ? payload.data.rss.email
        : payload.data.email;
    this.logger.log(
      `이메일 메시지가 발행되었습니다.: type=${payload.type}, email=${email}`,
    );
  }

  async produceUserCertification(user: User, uuid: string) {
    const payload = {
      type: EmailPayloadConstant.USER_CERTIFICATION,
      data: {
        email: user.email,
        userName: user.userName,
        uuid: uuid,
      },
    };

    await this.produceMessage(payload);
  }

  async produceRssRegistration(
    rss: Rss,
    approveFlag: boolean,
    description?: string,
  ) {
    const payload = {
      type: EmailPayloadConstant.RSS_REGISTRATION,
      data: {
        rss: rss,
        approveFlag: approveFlag,
        description: description ?? null,
      },
    };

    await this.produceMessage(payload);
  }

  async producePasswordReset(user: User, uuid: string) {
    const payload = {
      type: EmailPayloadConstant.PASSWORD_RESET,
      data: {
        email: user.email,
        userName: user.userName,
        uuid: uuid,
      },
    };
    await this.produceMessage(payload);
  }

  async produceAccountDeletion(user: User, uuid: string) {
    const payload = {
      type: EmailPayloadConstant.ACCOUNT_DELETION,
      data: {
        email: user.email,
        userName: user.userName,
        uuid: uuid,
      },
    };
    await this.produceMessage(payload);
  }

  async produceRssRemoval(
    userName: string,
    email: string,
    rssUrl: string,
    certificateCode: string,
  ) {
    const payload = {
      type: EmailPayloadConstant.RSS_REMOVAL,
      data: {
        userName,
        email,
        rssUrl,
        certificateCode,
      },
    };
    await this.produceMessage(payload);
  }
}
