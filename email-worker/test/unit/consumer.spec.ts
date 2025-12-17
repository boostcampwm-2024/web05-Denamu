import 'reflect-metadata';
import { EmailConsumer } from '../../src/email/email.consumer';
import { RabbitmqService } from '../../src/rabbitmq/rabbitmq.service';
import { EmailService } from '../../src/email/email.service';
import { RETRY_CONFIG, RMQ_QUEUES } from '../../src/rabbitmq/rabbitmq.constant';
import {
  EmailPayload,
  EmailPayloadConstant,
  User,
} from '../../src/types/types';

describe('Email Consumer Unit Test', () => {
  let consumer: EmailConsumer;
  let rabbitmqService: jest.Mocked<RabbitmqService>;
  let emailService: jest.Mocked<EmailService>;

  beforeEach(() => {
    jest.clearAllMocks();

    rabbitmqService = {
      sendMessageToQueue: jest.fn(),
      closeConsumer: jest.fn(),
      consumeMessage: jest.fn(),
    } as any;

    emailService = {
      sendUserCertificationMail: jest.fn(),
      sendRssMail: jest.fn(),
      sendRssRemoveCertificationMail: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
      sendDeleteAccountMail: jest.fn(),
    } as any;

    consumer = new EmailConsumer(rabbitmqService, emailService);
  });

  describe('handleEmailByError() 네트워크 에러 처리', () => {
    const mockPayload = {
      type: EmailPayloadConstant.USER_CERTIFICATION,
      data: {
        email: 'test@test.com',
        userName: '테스트',
        uuid: 'uuid-123',
      } as User,
    };

    describe('ESOCKET 에러', () => {
      const error = { code: 'ESOCKET', message: 'Socket error' };

      it('재시도 횟수 0: 첫 번째 대기 큐로 전송', async () => {
        const retryCount = 0;

        await consumer.handleEmailByError(error, mockPayload, retryCount);

        expect(rabbitmqService.sendMessageToQueue).toHaveBeenCalledTimes(1);
        const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];

        expect(calls[0]).toBe(RETRY_CONFIG.WAITING_QUEUE[0]);
        expect(calls[1]).toBe(JSON.stringify(mockPayload));
        expect(calls[2]).toEqual({
          headers: {
            'x-retry-count': 1,
          },
        });
      });

      it('재시도 횟수 1: 두 번째 대기 큐로 전송', async () => {
        const retryCount = 1;

        await consumer.handleEmailByError(error, mockPayload, retryCount);

        const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
        expect(calls[0]).toBe(RETRY_CONFIG.WAITING_QUEUE[1]);
        expect(calls[2]).toEqual({
          headers: {
            'x-retry-count': 2,
          },
        });
      });

      it('재시도 횟수 2: 세 번째 대기 큐로 전송', async () => {
        const retryCount = 2;

        await consumer.handleEmailByError(error, mockPayload, retryCount);

        const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
        expect(calls[0]).toBe(RETRY_CONFIG.WAITING_QUEUE[2]);
        expect(calls[2]).toEqual({
          headers: {
            'x-retry-count': 3,
          },
        });
      });

      it('MAX_RETRY 도달: DLQ로 전송', async () => {
        const retryCount = RETRY_CONFIG.MAX_RETRY;

        await consumer.handleEmailByError(error, mockPayload, retryCount);

        const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
        expect(calls[0]).toBe(RMQ_QUEUES.EMAIL_DEAD_LETTER);
        expect(calls[1]).toBe(JSON.stringify(mockPayload));
        expect(calls[2].headers).toMatchObject({
          'x-retry-count': RETRY_CONFIG.MAX_RETRY,
          'x-error-code': 'ESOCKET',
          'x-error-message': 'Socket error',
          'x-failure-type': 'MAX_RETRIES_EXCEEDED',
        });
        expect(calls[2].headers['x-failed-at']).toBeDefined();
      });
    });

    describe('ECONNREFUSED 에러', () => {
      const error = new Error('ECONNREFUSED');

      it('재시도 가능: 대기 큐로 전송', async () => {
        const retryCount = 1;

        await consumer.handleEmailByError(error, mockPayload, retryCount);

        const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
        expect(calls[0]).toBe(RETRY_CONFIG.WAITING_QUEUE[1]);
        expect(calls[2].headers['x-retry-count']).toBe(2);
      });

      it('MAX_RETRY 도달: DLQ로 전송', async () => {
        const retryCount = RETRY_CONFIG.MAX_RETRY;

        await consumer.handleEmailByError(error, mockPayload, retryCount);

        const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
        expect(calls[0]).toBe(RMQ_QUEUES.EMAIL_DEAD_LETTER);
        expect(calls[2].headers['x-error-message']).toBe('ECONNREFUSED');
      });
    });

    describe('ETIMEDOUT 에러', () => {
      const error = new Error('ETIMEDOUT');

      it('재시도 가능: 대기 큐로 전송', async () => {
        const retryCount = 0;

        await consumer.handleEmailByError(error, mockPayload, retryCount);

        const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
        expect(calls[0]).toBe(RETRY_CONFIG.WAITING_QUEUE[0]);
      });

      it('MAX_RETRY 도달: DLQ로 전송', async () => {
        const retryCount = RETRY_CONFIG.MAX_RETRY;

        await consumer.handleEmailByError(error, mockPayload, retryCount);

        const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
        expect(calls[0]).toBe(RMQ_QUEUES.EMAIL_DEAD_LETTER);
      });
    });

    describe('Unexpected socket close 에러', () => {
      const error = new Error('Unexpected socket close');

      it('재시도 가능: 대기 큐로 전송', async () => {
        const retryCount = 1;

        await consumer.handleEmailByError(error, mockPayload, retryCount);

        const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
        expect(calls[0]).toBe(RETRY_CONFIG.WAITING_QUEUE[1]);
      });

      it('MAX_RETRY 도달: DLQ로 전송', async () => {
        const retryCount = RETRY_CONFIG.MAX_RETRY;

        await consumer.handleEmailByError(error, mockPayload, retryCount);

        const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
        expect(calls[0]).toBe(RMQ_QUEUES.EMAIL_DEAD_LETTER);
      });
    });
  });

  describe('handleEmailByError() SMTP 에러 처리', () => {
    const mockPayload = {
      type: EmailPayloadConstant.PASSWORD_RESET,
      data: {
        email: 'user@test.com',
        userName: '유저',
        uuid: 'uuid-456',
      } as User,
    };

    describe('5xx 에러 (영구적 실패)', () => {
      it('500 에러: 즉시 DLQ로 전송', async () => {
        const error = {
          responseCode: 500,
          code: 'SMTP_ERROR',
          message: 'Internal Server Error',
        };
        const retryCount = 0;

        await consumer.handleEmailByError(error, mockPayload, retryCount);

        expect(rabbitmqService.sendMessageToQueue).toHaveBeenCalledTimes(1);
        const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];

        expect(calls[0]).toBe(RMQ_QUEUES.EMAIL_DEAD_LETTER);
        expect(calls[1]).toBe(JSON.stringify(mockPayload));
        expect(calls[2].headers).toMatchObject({
          'x-retry-count': 0,
          'x-response-code': 500,
          'x-error-message': 'Internal Server Error',
          'x-failure-type': 'SMTP_PERMANENT_FAILURE',
        });
      });

      it('550 에러 (Mailbox unavailable): 즉시 DLQ로 전송', async () => {
        const error = {
          responseCode: 550,
          code: 'SMTP_ERROR',
          message: 'Mailbox unavailable',
        };
        const retryCount = 2;

        await consumer.handleEmailByError(error, mockPayload, retryCount);

        const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
        expect(calls[0]).toBe(RMQ_QUEUES.EMAIL_DEAD_LETTER);
        expect(calls[2].headers['x-response-code']).toBe(550);
        expect(calls[2].headers['x-failure-type']).toBe(
          'SMTP_PERMANENT_FAILURE',
        );
      });

      it('554 에러: 즉시 DLQ로 전송', async () => {
        const error = {
          responseCode: 554,
          message: 'Transaction failed',
        };
        const retryCount = 1;

        await consumer.handleEmailByError(error, mockPayload, retryCount);

        const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
        expect(calls[0]).toBe(RMQ_QUEUES.EMAIL_DEAD_LETTER);
        expect(calls[2].headers['x-response-code']).toBe(554);
      });
    });

    describe('4xx 에러 (일시적 실패)', () => {
      it('421 에러 + 재시도 가능: 대기 큐로 전송', async () => {
        const error = {
          responseCode: 421,
          code: 'SMTP_ERROR',
          message: 'Service not available',
        };
        const retryCount = 0;

        await consumer.handleEmailByError(error, mockPayload, retryCount);

        const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
        expect(calls[0]).toBe(RETRY_CONFIG.WAITING_QUEUE[0]);
        expect(calls[2]).toEqual({
          headers: {
            'x-retry-count': 1,
          },
        });
      });

      it('450 에러 + 재시도 가능: 대기 큐로 전송', async () => {
        const error = {
          responseCode: 450,
          message: 'Requested mail action not taken',
        };
        const retryCount = 1;

        await consumer.handleEmailByError(error, mockPayload, retryCount);

        const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
        expect(calls[0]).toBe(RETRY_CONFIG.WAITING_QUEUE[1]);
        expect(calls[2].headers['x-retry-count']).toBe(2);
      });

      it('451 에러 + 재시도 가능: 대기 큐로 전송', async () => {
        const error = {
          responseCode: 451,
          message: 'Requested action aborted',
        };
        const retryCount = 2;

        await consumer.handleEmailByError(error, mockPayload, retryCount);

        const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
        expect(calls[0]).toBe(RETRY_CONFIG.WAITING_QUEUE[2]);
      });

      it('4xx 에러 + MAX_RETRY 도달: DLQ로 전송', async () => {
        const error = {
          responseCode: 450,
          message: 'Temporary failure',
        };
        const retryCount = RETRY_CONFIG.MAX_RETRY;

        await consumer.handleEmailByError(error, mockPayload, retryCount);

        const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
        expect(calls[0]).toBe(RMQ_QUEUES.EMAIL_DEAD_LETTER);
        expect(calls[2].headers).toMatchObject({
          'x-retry-count': RETRY_CONFIG.MAX_RETRY,
          'x-response-code': 450,
          'x-failure-type': 'MAX_RETRIES_EXCEEDED',
        });
      });
    });

    describe('3xx, 2xx 에러 (정상 응답으로 간주)', () => {
      it('250 응답: 에러가 아니므로 아무 큐로도 전송 안 함', async () => {
        const error = {
          responseCode: 250,
          message: 'OK',
        };
        const retryCount = 0;

        await consumer.handleEmailByError(error, mockPayload, retryCount);

        // responseCode < 400이므로 어떤 큐로도 전송되지 않고
        // 알 수 없는 에러로 처리되어 DLQ로 감
        const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
        expect(calls[0]).toBe(RMQ_QUEUES.EMAIL_DEAD_LETTER);
        expect(calls[2].headers['x-failure-type']).toBe('UNKNOWN_ERROR');
      });
    });
  });

  describe('handleEmailByError() 핸들링하지 않는 에러 처리', () => {
    const mockPayload: EmailPayload = {
      type: EmailPayloadConstant.USER_CERTIFICATION,
      data: {
        email: 'test@test.com',
        userName: 'Test',
        uuid: 'uuid-test',
      },
    };

    it('일반 Error 객체: DLQ로 전송', async () => {
      const error = new Error('Unknown error occurred');
      const retryCount = 1;

      await consumer.handleEmailByError(error, mockPayload, retryCount);

      const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
      expect(calls[0]).toBe(RMQ_QUEUES.EMAIL_DEAD_LETTER);
      expect(calls[2].headers).toMatchObject({
        'x-retry-count': 1,
        'x-error-code': 'UNKNOWN',
        'x-error-message': 'Unknown error occurred',
        'x-failure-type': 'UNKNOWN_ERROR',
      });
      expect(calls[2].headers['x-error-stack']).toBeDefined();
    });

    it('코드가 있는 Error 객체', async () => {
      const error = new Error('Custom error') as any;
      error.code = 'CUSTOM_CODE';

      await consumer.handleEmailByError(error, mockPayload, 0);

      const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
      expect(calls[2].headers['x-error-code']).toBe('CUSTOM_CODE');
    });

    it('메시지가 없는 Error 객체', async () => {
      const error = new Error();

      await consumer.handleEmailByError(error, mockPayload, 0);

      const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
      expect(calls[2].headers['x-error-message']).toBe('Unknown error');
    });
  });

  describe('handleEmailByError() retryCount 경계값 테스트', () => {
    const mockPayload = {
      type: EmailPayloadConstant.ACCOUNT_DELETION,
      data: { email: 'delete@test.com' } as User,
    };
    const networkError = new Error('ETIMEDOUT');

    it('retryCount = 0: 첫 번째 대기 큐로', async () => {
      const retryCount = 0;

      await consumer.handleEmailByError(networkError, mockPayload, retryCount);

      const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
      expect(calls[0]).toBe(RETRY_CONFIG.WAITING_QUEUE[0]);
      expect(calls[2].headers['x-retry-count']).toBe(1);
    });

    it('retryCount = 1: 두 번째 대기 큐로', async () => {
      const retryCount = 1;

      await consumer.handleEmailByError(networkError, mockPayload, retryCount);

      const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
      expect(calls[0]).toBe(RETRY_CONFIG.WAITING_QUEUE[1]);
      expect(calls[2].headers['x-retry-count']).toBe(2);
    });

    it('retryCount = MAX_RETRY - 1: 마지막 대기 큐로', async () => {
      const retryCount = RETRY_CONFIG.MAX_RETRY - 1;

      await consumer.handleEmailByError(networkError, mockPayload, retryCount);

      const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
      expect(calls[0]).toBe(RETRY_CONFIG.WAITING_QUEUE[retryCount]);
      expect(calls[2].headers['x-retry-count']).toBe(RETRY_CONFIG.MAX_RETRY);
    });

    it('retryCount = MAX_RETRY: DLQ로', async () => {
      const retryCount = RETRY_CONFIG.MAX_RETRY;

      await consumer.handleEmailByError(networkError, mockPayload, retryCount);

      const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
      expect(calls[0]).toBe(RMQ_QUEUES.EMAIL_DEAD_LETTER);
      expect(calls[2].headers['x-retry-count']).toBe(RETRY_CONFIG.MAX_RETRY);
      expect(calls[2].headers['x-failure-type']).toBe('MAX_RETRIES_EXCEEDED');
    });

    it('retryCount = MAX_RETRY + 1: DLQ로 (방어적 케이스)', async () => {
      const retryCount = RETRY_CONFIG.MAX_RETRY + 1;

      await consumer.handleEmailByError(networkError, mockPayload, retryCount);

      const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
      expect(calls[0]).toBe(RMQ_QUEUES.EMAIL_DEAD_LETTER);
    });

    describe('SMTP 4xx 에러의 경계값', () => {
      const smtpError = {
        responseCode: 450,
        message: 'Temporary failure',
      };

      it('retryCount = 0: 대기 큐로', async () => {
        const retryCount = 0;

        await consumer.handleEmailByError(smtpError, mockPayload, retryCount);

        const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
        expect(calls[0]).toBe(RETRY_CONFIG.WAITING_QUEUE[0]);
      });

      it('retryCount = MAX_RETRY - 1: 대기 큐로', async () => {
        const retryCount = RETRY_CONFIG.MAX_RETRY - 1;

        await consumer.handleEmailByError(smtpError, mockPayload, retryCount);

        const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
        expect(calls[0]).toBe(RETRY_CONFIG.WAITING_QUEUE[retryCount]);
      });

      it('retryCount = MAX_RETRY: DLQ로', async () => {
        const retryCount = RETRY_CONFIG.MAX_RETRY;

        await consumer.handleEmailByError(smtpError, mockPayload, retryCount);

        const calls = rabbitmqService.sendMessageToQueue.mock.calls[0];
        expect(calls[0]).toBe(RMQ_QUEUES.EMAIL_DEAD_LETTER);
      });
    });
  });
});
