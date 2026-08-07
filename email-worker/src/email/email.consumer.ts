import { inject, injectable } from 'tsyringe';

import { Options } from 'amqplib/properties';

import { DEPENDENCY_SYMBOLS } from '@common/dependency-symbols';
import { Lifecycle } from '@common/lifecycle/lifecycle.interface';
import logger from '@common/logger/logger';

import { EmailPayloadConstant } from '@email/constant';
import { classifyEmailError } from '@email/email.error';
import { EmailService } from '@email/email.service';
import { EmailPayload, NodeMailerError } from '@email/types';

import { NOTIFICATION_EVENT } from '@notification/notification-event.constant';
import { Notifier } from '@notification/notifier.interface';

import { RETRY_CONFIG, RMQ_QUEUES } from '@rabbitmq/rabbitmq.constant';
import { RabbitMQService } from '@rabbitmq/rabbitmq.service';

@injectable()
export class EmailConsumer implements Lifecycle {
  private consumerTag: string | null;
  private shuttingDownFlag = false;
  private pendingTasks = 0;
  private shutdownResolver: (() => void) | null = null;

  constructor(
    @inject(RabbitMQService)
    private readonly rabbitmqService: RabbitMQService,
    @inject(EmailService)
    private readonly emailService: EmailService,
    @inject(DEPENDENCY_SYMBOLS.Notifier)
    private readonly notifier: Notifier,
  ) {}

  async start() {
    logger.info('[EmailConsumer] 시작 중...');

    this.consumerTag = await this.rabbitmqService.consumeMessage<EmailPayload>(
      RMQ_QUEUES.EMAIL_SEND,
      async (payload, retryCount) => {
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
        } catch (error) {
          await this.handleEmailByError(
            error as NodeMailerError,
            payload,
            retryCount,
          );
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

  async stop(): Promise<void> {
    logger.info('새로운 메시지 수신 중지...');
    await this.stopConsuming();

    logger.info('진행 중인 이메일 전송 작업 완료 대기...');
    await this.waitForPendingTasks();

    logger.info('Consumer 정리 중...');
    await this.close();
  }

  async close() {
    if (!this.shuttingDownFlag && this.consumerTag) {
      await this.stopConsuming();
    }
    logger.info('[EmailConsumer] 종료');
  }

  async handleEmailByType(payload: EmailPayload) {
    switch (payload.type) {
      case EmailPayloadConstant.USER_CERTIFICATION:
        await this.emailService.sendUserCertificationMail(payload.data);
        break;

      case EmailPayloadConstant.RSS_REGISTRATION:
        await this.emailService.sendRssMail(payload.data);
        break;

      case EmailPayloadConstant.RSS_REGISTRATION_REQUEST:
        await this.emailService.sendRssRegistrationRequestMail(payload.data);
        break;

      case EmailPayloadConstant.RSS_REMOVAL:
        await this.emailService.sendRssRemoveCertificationMail(payload.data);
        break;

      case EmailPayloadConstant.RSS_CERTIFICATION:
        await this.emailService.sendRssCertificationMail(payload.data);
        break;

      case EmailPayloadConstant.PASSWORD_RESET:
        await this.emailService.sendPasswordResetEmail(payload.data);
        break;

      case EmailPayloadConstant.ACCOUNT_DELETION:
        await this.emailService.sendDeleteAccountMail(payload.data);
        break;

      case EmailPayloadConstant.QNA_ANSWERED:
        await this.emailService.sendQnaAnsweredMail(payload.data);
        break;

      case EmailPayloadConstant.NOTICE_PUBLISHED:
        await this.emailService.sendNoticePublishedMail(payload.data);
        break;

      case EmailPayloadConstant.MARKETING_BROADCAST:
        await this.emailService.sendMarketingBroadcastMail(payload.data);
        break;

      case EmailPayloadConstant.ADMIN_CERTIFICATION:
        await this.emailService.sendAdminCertificationMail(payload.data);
        break;

      case EmailPayloadConstant.ADMIN_ACCOUNT_DELETION:
        await this.emailService.sendAdminDeleteAccountMail(payload.data);
        break;

      case EmailPayloadConstant.ADMIN_PASSWORD_RESET:
        await this.emailService.sendAdminPasswordResetEmail(payload.data);
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

  async handleEmailByError(
    error: NodeMailerError,
    payload: EmailPayload,
    retryCount: number,
  ): Promise<void> {
    const stringifiedMessage = JSON.stringify(payload);
    const retryOptions: Options.Publish = {
      headers: {
        'x-retry-count': retryCount + 1,
      },
    };

    const classification = classifyEmailError(error);

    if (classification.retryable) {
      if (retryCount >= RETRY_CONFIG.MAX_RETRY) {
        await this.sendToDLQ(
          error,
          stringifiedMessage,
          retryCount,
          'MAX_RETRIES_EXCEEDED',
          '[retry count 초과]',
        );
        return;
      }
      await this.rabbitmqService.sendMessageToQueue(
        RETRY_CONFIG.WAITING_QUEUE[retryCount],
        stringifiedMessage,
        retryOptions,
      );
      return;
    }

    if (classification.failureType === 'UNKNOWN_ERROR') {
      logger.error(
        `[EmailConsumer] 알 수 없는 에러로 DLQ 메시지 발행
      오류 메시지: ${error.message}
      스택 트레이스: ${error.stack}`,
      );
      await this.sendToDLQ(
        error,
        stringifiedMessage,
        retryCount,
        'UNKNOWN_ERROR',
        '[알 수 없는 에러 발생]',
      );
      return;
    }

    await this.sendToDLQ(
      error,
      stringifiedMessage,
      retryCount,
      'SMTP_PERMANENT_FAILURE',
      '[SMTP 500 에러 발생]',
    );
  }

  private createDLQHeaders(
    error: NodeMailerError,
    retryCount: number,
    failureType:
      | 'SMTP_PERMANENT_FAILURE'
      | 'MAX_RETRIES_EXCEEDED'
      | 'UNKNOWN_ERROR',
  ) {
    const headers: Record<string, any> = {
      'x-retry-count': retryCount,
      'x-error-code': error.code || 'UNKNOWN',
      'x-error-message': error.message || 'Unknown error',
      'x-failed-at': new Date().toISOString(),
      'x-failure-type': failureType,
    };

    if (error.responseCode !== undefined) {
      headers['x-response-code'] = error.responseCode;
    }

    if (error.stack) {
      headers['x-error-stack'] = error.stack;
    }

    return headers;
  }

  private async sendToDLQ(
    error: NodeMailerError,
    stringifiedMessage: string,
    retryCount: number,
    failureType:
      | 'SMTP_PERMANENT_FAILURE'
      | 'MAX_RETRIES_EXCEEDED'
      | 'UNKNOWN_ERROR',
    dlqMessage: string,
  ): Promise<void> {
    const startTime = Date.now();
    await this.rabbitmqService.sendMessageToQueue(
      RMQ_QUEUES.EMAIL_DEAD_LETTER,
      stringifiedMessage,
      {
        headers: this.createDLQHeaders(error, retryCount, failureType),
      },
    );
    logger.info(
      `${error.message}에러에 대한 메시지 발행 소요 시간: ${Date.now() - startTime}`,
    );
    this.notifier.publish(NOTIFICATION_EVENT.EMAIL_DLQ, { error, dlqMessage });
  }
}
