import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { inject, injectable } from 'tsyringe';
import { DEPENDENCY_SYMBOLS } from '../types/dependency-symbols';
import { EmailService } from './email.service';
import logger from '../logger';
import { InfoCodes, WarnCodes, ErrorCodes } from '../log-codes';
import { RETRY_CONFIG, RMQ_QUEUES } from '../rabbitmq/rabbitmq.constant';
import { EmailPayload, EmailPayloadConstant } from '../types/types';
import { Options } from 'amqplib/properties';

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
    logger.info('EmailConsumer 시작 중...', {
      code: InfoCodes.EW_CONSUMER_START,
      context: 'EmailConsumer',
    });

    this.consumerTag = await this.rabbitmqService.consumeMessage(
      RMQ_QUEUES.EMAIL_SEND,
      async (payload: EmailPayload, retryCount: number) => {
        if (this.shuttingDownFlag) {
          logger.warn('Shutdown 중, 메시지 처리 건너뜀', {
            code: WarnCodes.EW_CONSUMER_SHUTDOWN_SKIP,
            context: 'EmailConsumer',
          });
          throw new Error('SHUTDOWN_IN_PROGRESS');
        }

        this.pendingTasks++;
        logger.info('이메일 전송 시작', {
          code: InfoCodes.EW_CONSUMER_TASK_START,
          context: 'EmailConsumer',
          pendingTasks: this.pendingTasks,
        });

        try {
          await this.handleEmailByType(payload);
          logger.info('이메일 전송 완료', {
            code: InfoCodes.EW_CONSUMER_TASK_COMPLETE,
            context: 'EmailConsumer',
          });
        } catch (error) {
          await this.handleEmailByError(error, payload, retryCount);
        } finally {
          this.pendingTasks--;
          logger.info(`남은 작업: ${this.pendingTasks}`, {
            code: InfoCodes.EW_CONSUMER_TASK_REMAINING,
            context: 'EmailConsumer',
            pendingTasks: this.pendingTasks,
          });

          if (
            this.shuttingDownFlag &&
            this.pendingTasks === 0 &&
            this.shutdownResolver
          ) {
            logger.info('모든 작업 완료 - Shutdown 진행', {
              code: InfoCodes.EW_CONSUMER_ALL_COMPLETE,
              context: 'EmailConsumer',
            });
            this.shutdownResolver();
          }
        }
      },
    );

    logger.info('이메일 큐 리스닝 시작', {
      code: InfoCodes.EW_CONSUMER_LISTENING,
      context: 'EmailConsumer',
    });
  }

  async close() {
    if (!this.shuttingDownFlag && this.consumerTag) {
      await this.stopConsuming();
    }
    logger.info('EmailConsumer 종료', {
      code: InfoCodes.EW_CONSUMER_CLOSE,
      context: 'EmailConsumer',
    });
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
        logger.info('처리할 수 없는 이메일 타입이 입력되었습니다.', {
          code: InfoCodes.EW_EMAIL_TYPE_UNKNOWN,
          context: 'EmailConsumer',
          payloadType: (payload as any).type,
        });
    }
  }

  async stopConsuming(): Promise<void> {
    this.shuttingDownFlag = true;

    if (this.consumerTag) {
      await this.rabbitmqService.closeConsumer(this.consumerTag);
      logger.info('Consumer 중지 - 새 메시지 받지 않음', {
        code: InfoCodes.EW_CONSUMER_STOP,
        context: 'EmailConsumer',
      });
    }
  }

  async waitForPendingTasks(): Promise<void> {
    if (this.pendingTasks === 0) {
      logger.info('대기 중인 작업 없음', {
        code: InfoCodes.EW_CONSUMER_NO_PENDING,
        context: 'EmailConsumer',
      });
      return;
    }

    logger.info(`${this.pendingTasks}개 작업 완료 대기 중...`, {
      code: InfoCodes.EW_CONSUMER_WAIT_PENDING,
      context: 'EmailConsumer',
      pendingTasks: this.pendingTasks,
    });

    return new Promise((resolve) => {
      this.shutdownResolver = resolve;

      setTimeout(() => {
        logger.warn('대기 시간 초과 - 강제 종료', {
          code: WarnCodes.EW_CONSUMER_TIMEOUT,
          context: 'EmailConsumer',
          pendingTasks: this.pendingTasks,
        });
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

    logger.error('알 수 없는 에러로 DLQ 메시지 발행', {
      code: ErrorCodes.EW_EMAIL_UNKNOWN_ERROR,
      context: 'EmailConsumer',
      errorMessage: error.message,
      stack: error.stack,
    });
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
