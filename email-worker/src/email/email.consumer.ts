import { inject, injectable } from 'tsyringe';

import { Options } from 'amqplib/properties';

import logger from '@src/logger';

import { EmailService } from '@email/email.service';

import { RETRY_CONFIG, RMQ_QUEUES } from '@rabbitmq/rabbitmq.constant';
import { RabbitmqService } from '@rabbitmq/rabbitmq.service';

import { DEPENDENCY_SYMBOLS } from '@app-types/dependency-symbols';
import { EmailPayload, EmailPayloadConstant } from '@app-types/types';

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
      async (payload: EmailPayload, retryCount: number) => {
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
          await this.handleEmailByError(error, payload, retryCount);
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
      case EmailPayloadConstant.USER_CERTIFICATION:
        await this.emailService.sendUserCertificationMail(payload.data);
        break;

      case EmailPayloadConstant.RSS_REGISTRATION:
        await this.emailService.sendRssMail(payload.data);
        break;

      case EmailPayloadConstant.RSS_REMOVAL:
        await this.emailService.sendRssRemoveCertificationMail(payload.data);
        break;

      case EmailPayloadConstant.PASSWORD_RESET:
        await this.emailService.sendPasswordResetEmail(payload.data);
        break;

      case EmailPayloadConstant.ACCOUNT_DELETION:
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

  /**
   * 이메일 전송 실패 시 에러 타입에 따라 재시도 또는 DLQ 처리를 수행합니다.
   *
   * @description
   * 에러 처리 흐름:
   * 1. 네트워크 에러 (ECONNREFUSED, ETIMEDOUT 등)
   *    - 재시도 횟수 < 3회: Wait Queue로 재시도
   *    - 재시도 횟수 >= 3회: DLQ로 발행 (MAX_RETRIES_EXCEEDED)
   *
   * 2. SMTP 에러
   *    - 5xx 에러: 즉시 DLQ로 발행 (SMTP_PERMANENT_FAILURE)
   *    - 4xx 에러:
   *      - 재시도 횟수 < 3회: Wait Queue로 재시도
   *      - 재시도 횟수 >= 3회: DLQ로 발행 (MAX_RETRIES_EXCEEDED)
   *
   * 3. 알 수 없는 에러: 즉시 DLQ로 발행 (UNKNOWN_ERROR)
   *
   * @param {any} error - 발생한 에러 객체 (네트워크 에러, SMTP 에러 등)
   * @param {EmailPayload} payload - 전송 실패한 이메일 페이로드
   * @param {number} retryCount - 현재까지의 재시도 횟수 (0부터 시작)
   *
   * @returns {Promise<void>}
   *
   * @example
   * // 네트워크 에러로 첫 번째 재시도
   * await handleEmailByError(
   *   new Error('ECONNREFUSED'),
   *   { type: 'userCertification', ... },
   *   0
   * );
   * // -> Wait Queue에 발행됨
   *
   * @example
   * // SMTP 5xx 에러
   * await handleEmailByError(
   *   { responseCode: 550, message: 'Mailbox not found' },
   *   { type: 'userCertification', ... },
   *   0
   * );
   * // -> 즉시 DLQ로 발행됨 (SMTP_PERMANENT_FAILURE)
   */
  async handleEmailByError(
    error: any,
    payload: EmailPayload,
    retryCount: number,
  ): Promise<void> {
    const stringifiedMessage = JSON.stringify(payload);
    const retryOptions: Options.Publish = {
      headers: {
        'x-retry-count': retryCount + 1,
      },
    };

    // Node.js 네트워크 레벨의 에러
    const isNetworkError =
      error.code === 'ESOCKET' ||
      error.message?.includes('ECONNREFUSED') ||
      error.message?.includes('ETIMEDOUT') ||
      error.message?.includes('Unexpected socket close');
    if (isNetworkError) {
      if (retryCount >= RETRY_CONFIG.MAX_RETRY) {
        await this.rabbitmqService.sendMessageToQueue(
          RMQ_QUEUES.EMAIL_DEAD_LETTER,
          stringifiedMessage,
          {
            headers: this.createDLQHeaders(
              error,
              retryCount,
              'MAX_RETRIES_EXCEEDED',
            ),
          },
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
    // SMTP 레벨의 에러
    if (error.responseCode) {
      if (error.responseCode >= 500) {
        await this.rabbitmqService.sendMessageToQueue(
          RMQ_QUEUES.EMAIL_DEAD_LETTER,
          stringifiedMessage,
          {
            headers: this.createDLQHeaders(
              error,
              retryCount,
              'SMTP_PERMANENT_FAILURE',
            ),
          },
        );
        return;
      }

      if (error.responseCode >= 400) {
        if (retryCount >= RETRY_CONFIG.MAX_RETRY) {
          await this.rabbitmqService.sendMessageToQueue(
            RMQ_QUEUES.EMAIL_DEAD_LETTER,
            stringifiedMessage,
            {
              headers: this.createDLQHeaders(
                error,
                retryCount,
                'MAX_RETRIES_EXCEEDED',
              ),
            },
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
    }

    logger.error(
      `[EmailConsumer] 알 수 없는 에러로 DLQ 메시지 발행
      오류 메시지: ${error.message} 
      스택 트레이스: ${error.stack}`,
    );
    // 즉시 DLQ로 메시지 발행
    // todo: Slack 이나 Discord 연동을 통한 새로운 에러에 대한 알림 구현
    await this.rabbitmqService.sendMessageToQueue(
      RMQ_QUEUES.EMAIL_DEAD_LETTER,
      stringifiedMessage,
      {
        headers: this.createDLQHeaders(error, retryCount, 'UNKNOWN_ERROR'),
      },
    );
  }

  private createDLQHeaders(
    error: any,
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
}
