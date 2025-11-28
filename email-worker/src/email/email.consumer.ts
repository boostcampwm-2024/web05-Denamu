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
  private shuttingDownFlag = false;
  private pendingTasks = 0;
  private shutdownResolver: (() => void) | null = null;

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
        if (this.shuttingDownFlag) {
          logger.warn('[EmailConsumer] Shutdown 중, 메시지 처리 건너뜀');
          throw new Error('SHUTDOWN_IN_PROGRESS');
        }

        this.pendingTasks++;
        logger.info(
          `[EmailConsumer] 이메일 전송 시작 (대기 중인 작업: ${this.pendingTasks})`,
        );

        try {
          await this.handleEmailByType(payload);
          logger.info('[EmailConsumer] 이메일 전송 완료');
        } finally {
          this.pendingTasks--;
          logger.info(`[EmailConsumer] 남은 작업: ${this.pendingTasks}`);

          if (
            this.shuttingDownFlag &&
            this.pendingTasks === 0 &&
            this.shutdownResolver
          ) {
            logger.info('[EmailConsumer] 모든 작업 완료 - Shutdown 진행');
            this.shutdownResolver();
          }
        }
      },
    );

    logger.info('[EmailConsumer] 이메일 큐 리스닝 시작');
  }

  async close() {
    if (!this.shuttingDownFlag && this.consumerTag) {
      await this.stopConsuming();
    }
    logger.info('[EmailConsumer] 종료');
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

  async stopConsuming(): Promise<void> {
    this.shuttingDownFlag = true;

    if (this.consumerTag) {
      await this.rabbitmqService.closeConsumer(this.consumerTag);
      logger.info('[EmailConsumer] Consumer 중지 - 새 메시지 받지 않음');
    }
  }

  async waitForPendingTasks(): Promise<void> {
    if (this.pendingTasks === 0) {
      logger.info('[EmailConsumer] 대기 중인 작업 없음');
      return;
    }

    logger.info(`[EmailConsumer] ${this.pendingTasks}개 작업 완료 대기 중...`);

    return new Promise((resolve) => {
      this.shutdownResolver = resolve;

      setTimeout(() => {
        logger.warn(
          `[EmailConsumer] 대기 시간 초과 - 강제 종료 (남은 작업: ${this.pendingTasks})`,
        );
        resolve();
      }, 10000);
    });
  }
}
