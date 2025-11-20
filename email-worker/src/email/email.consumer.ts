import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { inject, injectable } from 'tsyringe';
import { DEPENDENCY_SYMBOLS } from '../types/dependency-symbols';
import { EmailService } from './email.service';
import logger from '../logger';
import { RMQ_QUEUES } from '../rabbitmq/rabbitmq.constant';
import { EmailPayload } from '../types/types';

@injectable()
export class EmailConsumer {
  private consumerTag: string | null;

  constructor(
    @inject(DEPENDENCY_SYMBOLS.RabbitMQService)
    private readonly rabbitmqService: RabbitmqService,
    @inject(DEPENDENCY_SYMBOLS.EmailService)
    private readonly emailService: EmailService,
  ) {}

  async start() {
    logger.info('[EmailConsumer] 시작 중...');

    this.consumerTag = await this.rabbitmqService.consumeMessage(
      RMQ_QUEUES.EMAIL_SEND,
      async (payload: EmailPayload) => {
        await this.handleEmailByType(payload);
      },
    );

    logger.info('[EmailConsumer] 이메일 큐 리스닝 시작');
  }
  async close() {
    await this.rabbitmqService.closeConsumer(this.consumerTag);
    logger.info('[EmailConsumer] 종료 완료');
  }

  async handleEmailByType(payload: EmailPayload) {
    switch (payload.type) {
      case 'userCertification':
        await this.emailService.sendUserCertificationMail(payload.data);
        break;

      case 'rssRegistration':
        await this.emailService.sendRssMail(payload.data);
        break;

      case 'rssRemove':
        await this.emailService.sendRssRemoveCertificationMail(payload.data);
        break;

      case 'resetPassword':
        await this.emailService.sendPasswordResetEmail(payload.data);
        break;

      case 'deleteAccount':
        await this.emailService.sendDeleteAccountMail(payload.data);
        break;

      default:
        logger.info(`처리할 수 없는 이메일 타입이 입력되었습니다.`);
    }
  }
}
