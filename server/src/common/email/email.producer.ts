import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { WinstonLoggerService } from '../logger/logger.service';
import { RMQ_EXCHANGES, RMQ_ROUTING_KEYS } from '../rabbitmq/rabbitmq.constant';
import { EmailPayload } from './email.type';
import { User } from '../../user/entity/user.entity';
import { Rss } from '../../rss/entity/rss.entity';

@Injectable()
export class EmailProducer {
  constructor(
    private readonly rabbitmqService: RabbitMQService,
    private readonly logger: WinstonLoggerService,
  ) {}

  private async produceMessage(payload: EmailPayload): Promise<void> {
    await this.rabbitmqService.sendMessage(
      RMQ_EXCHANGES.EMAIL,
      RMQ_ROUTING_KEYS.EMAIL_SEND,
      payload,
    );

    const email =
      payload.type === ('rssRegistration' as const)
        ? payload.data.rss.email
        : payload.data.email;
    this.logger.log(
      `이메일 메시지가 발행되었습니다.: type=${payload.type}, email=${email}`,
    );
  }

  async produceUserCertification(user: User, uuid: string) {
    const payload = {
      type: 'userCertification' as const,
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
      type: 'rssRegistration' as const,
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
      type: 'resetPassword' as const,
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
      type: 'deleteAccount' as const,
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
      type: 'rssRemove' as const,
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
