import 'reflect-metadata';
import { EmailConsumer } from '@email/email.consumer';
import { RabbitMQService } from '@rabbitmq/rabbitmq.service';
import { EmailService } from '@email/email.service';
import { EmailPayload, EmailPayloadConstant } from '@src/types/types';
import { RMQ_QUEUES, RETRY_CONFIG } from '@rabbitmq/rabbitmq.constant';
import { setupTestContainer } from '@test/setup/testContext.setup';
import { RabbitMQManager } from '@rabbitmq/rabbitmq.manager';
import { Channel } from 'amqplib';
import {
  getMessagesFromQueue,
  getQueueMessageCount,
  publishEmailMessage,
  waitForQueueMessage,
  purgeAllEmailQueues,
  clearMailpit,
  getMailpitMessages,
} from '@test/helpers/rabbitmq-test.helper';

describe('Email Error Handling E2E Test', () => {
  let emailConsumer: EmailConsumer;
  let emailService: EmailService;
  let rabbitmqService: RabbitMQService;
  let rabbitmqManager: RabbitMQManager;
  let channel: Channel;
  const testContext = setupTestContainer();

  const testPayload: EmailPayload = {
    type: EmailPayloadConstant.USER_CERTIFICATION,
    data: {
      email: 'test@test.com',
      userName: 'tester',
      uuid: 'test-uuid',
    },
  };

  beforeAll(async () => {
    emailConsumer = testContext.emailConsumer;
    emailService = testContext.emailService;
    rabbitmqService = testContext.rabbitmqService;
    rabbitmqManager = testContext.rabbitmqManager;
    channel = await rabbitmqManager.getChannel();
  });

  beforeEach(async () => {
    await purgeAllEmailQueues(channel);
    await clearMailpit();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    console.log('Closing Email Consumer...');
    if (global.testContext) {
      await emailConsumer.close();
      await rabbitmqManager.disconnect();
      delete global.testContext;
    }
    console.log('Email Consumer closed.');
  });

  describe('네트워크 에러 → Waiting Queue 시나리오', () => {
    it('ECONNREFUSED 에러 발생 시 email.wait.5s 큐에 메시지가 존재한다', async () => {
      // Given: 네트워크 에러를 발생시키는 상황
      const networkError = new Error('ECONNREFUSED');
      jest
        .spyOn(emailService, 'sendUserCertificationMail')
        .mockRejectedValueOnce(networkError);

      // When: 메시지 발행 후 컨슈머 처리
      await publishEmailMessage(rabbitmqService, testPayload);
      await emailConsumer.start();
      await waitForQueueMessage(channel, RMQ_QUEUES.EMAIL_SEND_WAIT_5S);

      // Then: WAIT_5S 큐에 메시지가 존재하는지 확인
      const messages = await getMessagesFromQueue(
        RMQ_QUEUES.EMAIL_SEND_WAIT_5S,
      );
      expect(messages).toHaveLength(1);
      expect(messages[0].headers['x-retry-count']).toBe(1);
      expect(messages[0].content.type).toBe(
        EmailPayloadConstant.USER_CERTIFICATION,
      );
    });

    it('ETIMEDOUT 에러 + retryCount=1 → email.wait.10s 큐에 메시지가 존재한다', async () => {
      // Given
      const networkError = new Error('ETIMEDOUT');
      jest
        .spyOn(emailService, 'sendUserCertificationMail')
        .mockRejectedValueOnce(networkError);

      // When: retryCount=1인 메시지 발행
      await publishEmailMessage(rabbitmqService, testPayload, {
        'x-retry-count': 1,
      });
      await emailConsumer.start();
      await waitForQueueMessage(channel, RMQ_QUEUES.EMAIL_SEND_WAIT_10S);

      // Then
      const messages = await getMessagesFromQueue(
        RMQ_QUEUES.EMAIL_SEND_WAIT_10S,
      );
      expect(messages).toHaveLength(1);
      expect(messages[0].headers['x-retry-count']).toBe(2);
    });

    it('Socket close 에러 + retryCount=2 → email.wait.20s 큐에 메시지가 존재한다', async () => {
      // Given
      const networkError = new Error('Unexpected socket close');
      jest
        .spyOn(emailService, 'sendUserCertificationMail')
        .mockRejectedValueOnce(networkError);

      // When
      await publishEmailMessage(rabbitmqService, testPayload, {
        'x-retry-count': 2,
      });
      await emailConsumer.start();
      await waitForQueueMessage(channel, RMQ_QUEUES.EMAIL_SEND_WAIT_20S);

      // Then
      const messages = await getMessagesFromQueue(
        RMQ_QUEUES.EMAIL_SEND_WAIT_20S,
      );
      expect(messages).toHaveLength(1);
      expect(messages[0].headers['x-retry-count']).toBe(3);
    });
  });

  describe('SMTP 4xx 에러 → Waiting Queue 시나리오', () => {
    it('SMTP 450 에러 발생 시 email.wait.5s 큐에 메시지가 존재한다', async () => {
      // Given: SMTP 450 (Mailbox temporarily unavailable)
      const smtpError = {
        responseCode: 450,
        message: 'Mailbox temporarily unavailable',
      };
      jest
        .spyOn(emailService, 'sendUserCertificationMail')
        .mockRejectedValueOnce(smtpError);

      // When
      await publishEmailMessage(rabbitmqService, testPayload);
      await emailConsumer.start();
      await waitForQueueMessage(channel, RMQ_QUEUES.EMAIL_SEND_WAIT_5S);

      // Then
      const messages = await getMessagesFromQueue(
        RMQ_QUEUES.EMAIL_SEND_WAIT_5S,
      );
      expect(messages).toHaveLength(1);
      expect(messages[0].headers['x-retry-count']).toBe(1);
    });

    it('SMTP 421 에러 + retryCount=2 → email.wait.20s 큐에 메시지가 존재한다', async () => {
      // Given: SMTP 421 (Service not available)
      const smtpError = {
        responseCode: 421,
        message: 'Service not available',
      };
      jest
        .spyOn(emailService, 'sendUserCertificationMail')
        .mockRejectedValueOnce(smtpError);

      // When
      await publishEmailMessage(rabbitmqService, testPayload, {
        'x-retry-count': 2,
      });
      await emailConsumer.start();
      await waitForQueueMessage(channel, RMQ_QUEUES.EMAIL_SEND_WAIT_20S);

      // Then
      const messages = await getMessagesFromQueue(
        RMQ_QUEUES.EMAIL_SEND_WAIT_20S,
      );
      expect(messages).toHaveLength(1);
      expect(messages[0].headers['x-retry-count']).toBe(3);
    });
  });

  describe('SMTP 5xx 에러 → 즉시 DLQ 시나리오', () => {
    it('SMTP 550 에러 발생하면 즉시 email.dlq 큐에 메시지가 존재한다', async () => {
      // Given: SMTP 550 (Mailbox not found) - 영구적 에러
      const smtpError = {
        responseCode: 550,
        message: 'Mailbox not found',
        code: 'EENVELOPE',
      };
      jest
        .spyOn(emailService, 'sendUserCertificationMail')
        .mockRejectedValueOnce(smtpError);

      // When
      await publishEmailMessage(rabbitmqService, testPayload);
      await emailConsumer.start();
      await waitForQueueMessage(channel, RMQ_QUEUES.EMAIL_DEAD_LETTER);

      // Then: DLQ에 메시지 존재
      const dlqMessages = await getMessagesFromQueue(
        RMQ_QUEUES.EMAIL_DEAD_LETTER,
      );
      expect(dlqMessages).toHaveLength(1);
      expect(dlqMessages[0].headers['x-failure-type']).toBe(
        'SMTP_PERMANENT_FAILURE',
      );
      expect(dlqMessages[0].headers['x-response-code']).toBe(550);
      expect(dlqMessages[0].headers['x-retry-count']).toBe(0);

      // Waiting Queue에는 메시지가 없어야 함
      const wait5sCount = await getQueueMessageCount(
        channel,
        RMQ_QUEUES.EMAIL_SEND_WAIT_5S,
      );
      expect(wait5sCount).toBe(0);
    });

    it('SMTP 553 에러 발생하면 기존 retryCount와 무관하게 즉시 DLQ로 전송된다', async () => {
      // Given: 이미 재시도가 있었지만 5xx는 즉시 DLQ
      const smtpError = {
        responseCode: 553,
        message: 'Invalid email address',
        code: 'EENVELOPE',
      };
      jest
        .spyOn(emailService, 'sendUserCertificationMail')
        .mockRejectedValueOnce(smtpError);

      // When: retryCount=2인 상태에서 5xx 에러 발생
      await publishEmailMessage(rabbitmqService, testPayload, {
        'x-retry-count': 2,
      });
      await emailConsumer.start();
      await waitForQueueMessage(channel, RMQ_QUEUES.EMAIL_DEAD_LETTER);

      // Then
      const dlqMessages = await getMessagesFromQueue(
        RMQ_QUEUES.EMAIL_DEAD_LETTER,
      );
      expect(dlqMessages).toHaveLength(1);
      expect(dlqMessages[0].headers['x-failure-type']).toBe(
        'SMTP_PERMANENT_FAILURE',
      );
      expect(dlqMessages[0].headers['x-response-code']).toBe(553);
      // 기존 retryCount가 그대로 유지됨
      expect(dlqMessages[0].headers['x-retry-count']).toBe(2);
    });

    it('SMTP 554 에러(Transaction failed) 발생하면 즉시 DLQ로 전송된다', async () => {
      // Given
      const smtpError = {
        responseCode: 554,
        message: 'Transaction failed',
        code: 'EMESSAGE',
      };
      jest
        .spyOn(emailService, 'sendUserCertificationMail')
        .mockRejectedValueOnce(smtpError);

      // When
      await publishEmailMessage(rabbitmqService, testPayload);
      await emailConsumer.start();
      await waitForQueueMessage(channel, RMQ_QUEUES.EMAIL_DEAD_LETTER);

      // Then
      const dlqMessages = await getMessagesFromQueue(
        RMQ_QUEUES.EMAIL_DEAD_LETTER,
      );
      expect(dlqMessages).toHaveLength(1);
      expect(dlqMessages[0].headers['x-failure-type']).toBe(
        'SMTP_PERMANENT_FAILURE',
      );
    });
  });

  describe('최대 재시도 초과 → DLQ 시나리오', () => {
    it('네트워크 에러로 MAX_RETRY(3) 도달 시 email.dlq 큐에 메시지가 존재한다', async () => {
      // Given: retryCount가 이미 MAX_RETRY에 도달한 상태
      const networkError = new Error('ECONNREFUSED');
      networkError['code'] = 'ESOCKET';
      jest
        .spyOn(emailService, 'sendUserCertificationMail')
        .mockRejectedValueOnce(networkError);

      // When: MAX_RETRY인 메시지에서 다시 에러 발생
      await publishEmailMessage(rabbitmqService, testPayload, {
        'x-retry-count': RETRY_CONFIG.MAX_RETRY,
      });
      await emailConsumer.start();
      await waitForQueueMessage(channel, RMQ_QUEUES.EMAIL_DEAD_LETTER);

      // Then
      const dlqMessages = await getMessagesFromQueue(
        RMQ_QUEUES.EMAIL_DEAD_LETTER,
      );
      expect(dlqMessages).toHaveLength(1);
      expect(dlqMessages[0].headers['x-failure-type']).toBe(
        'MAX_RETRIES_EXCEEDED',
      );
      expect(dlqMessages[0].headers['x-retry-count']).toBe(
        RETRY_CONFIG.MAX_RETRY,
      );

      // 이메일이 발송되지 않았어야 함
      const emails = await getMailpitMessages();
      expect(emails).toHaveLength(0);
    });

    it('SMTP 4xx 에러로 MAX_RETRY 도달 시 email.dlq 큐에 메시지가 존재한다', async () => {
      // Given
      const smtpError = {
        responseCode: 450,
        message: 'Mailbox temporarily unavailable',
      };
      jest
        .spyOn(emailService, 'sendUserCertificationMail')
        .mockRejectedValueOnce(smtpError);

      // When
      await publishEmailMessage(rabbitmqService, testPayload, {
        'x-retry-count': RETRY_CONFIG.MAX_RETRY,
      });
      await emailConsumer.start();
      await waitForQueueMessage(channel, RMQ_QUEUES.EMAIL_DEAD_LETTER);

      // Then
      const dlqMessages = await getMessagesFromQueue(
        RMQ_QUEUES.EMAIL_DEAD_LETTER,
      );
      expect(dlqMessages).toHaveLength(1);
      expect(dlqMessages[0].headers['x-failure-type']).toBe(
        'MAX_RETRIES_EXCEEDED',
      );
      expect(dlqMessages[0].headers['x-response-code']).toBe(450);
    });
  });

  describe('알 수 없는 에러 → 즉시 DLQ 시나리오', () => {
    it('알 수 없는 에러 발생 시 재시도 없이 email.dlq 큐에 메시지가 존재한다', async () => {
      // Given: 분류할 수 없는 에러
      const unknownError = new Error('Unexpected error occurred');
      jest
        .spyOn(emailService, 'sendUserCertificationMail')
        .mockRejectedValueOnce(unknownError);

      // When
      await publishEmailMessage(rabbitmqService, testPayload);
      await emailConsumer.start();
      await waitForQueueMessage(channel, RMQ_QUEUES.EMAIL_DEAD_LETTER);

      // Then
      const dlqMessages = await getMessagesFromQueue(
        RMQ_QUEUES.EMAIL_DEAD_LETTER,
      );
      expect(dlqMessages).toHaveLength(1);
      expect(dlqMessages[0].headers['x-failure-type']).toBe('UNKNOWN_ERROR');
      expect(dlqMessages[0].headers['x-error-message']).toBe(
        'Unexpected error occurred',
      );

      // Waiting Queue에는 메시지가 없어야 함
      const wait5sCount = await getQueueMessageCount(
        channel,
        RMQ_QUEUES.EMAIL_SEND_WAIT_5S,
      );
      expect(wait5sCount).toBe(0);
    });

    it('code와 responseCode가 없는 에러 객체는 UNKNOWN_ERROR로 DLQ에 전송된다', async () => {
      // Given
      const bareError = { message: 'Some bare error object' };
      jest
        .spyOn(emailService, 'sendUserCertificationMail')
        .mockRejectedValueOnce(bareError);

      // When
      await publishEmailMessage(rabbitmqService, testPayload);
      await emailConsumer.start();
      await waitForQueueMessage(channel, RMQ_QUEUES.EMAIL_DEAD_LETTER);

      // Then
      const dlqMessages = await getMessagesFromQueue(
        RMQ_QUEUES.EMAIL_DEAD_LETTER,
      );
      expect(dlqMessages).toHaveLength(1);
      expect(dlqMessages[0].headers['x-failure-type']).toBe('UNKNOWN_ERROR');
      expect(dlqMessages[0].headers['x-error-code']).toBe('UNKNOWN');
    });
  });

  describe('DLQ 메시지 헤더 검증', () => {
    it('DLQ 메시지에는 디버깅을 위한 필수 헤더가 모두 포함되어야 한다', async () => {
      // Given
      const smtpError = {
        responseCode: 550,
        message: 'User unknown',
        code: 'EENVELOPE',
        stack: 'Error: User unknown\n    at EmailService.sendMail',
      };
      jest
        .spyOn(emailService, 'sendUserCertificationMail')
        .mockRejectedValueOnce(smtpError);

      // When
      await publishEmailMessage(rabbitmqService, testPayload);
      await emailConsumer.start();
      await waitForQueueMessage(channel, RMQ_QUEUES.EMAIL_DEAD_LETTER);

      // Then
      const dlqMessages = await getMessagesFromQueue(
        RMQ_QUEUES.EMAIL_DEAD_LETTER,
      );
      expect(dlqMessages).toHaveLength(1);

      const headers = dlqMessages[0].headers;

      // 필수 헤더 검증
      expect(headers['x-retry-count']).toBeDefined();
      expect(headers['x-error-code']).toBe('EENVELOPE');
      expect(headers['x-error-message']).toBe('User unknown');
      expect(headers['x-failed-at']).toBeDefined();
      expect(headers['x-failure-type']).toBe('SMTP_PERMANENT_FAILURE');
      expect(headers['x-response-code']).toBe(550);
      expect(headers['x-error-stack']).toBeDefined();

      // x-failed-at이 유효한 ISO 날짜 형식인지 확인
      const failedAt = new Date(headers['x-failed-at']);
      expect(failedAt.getTime()).not.toBeNaN();

      // 원본 페이로드가 보존되어야 함
      expect(dlqMessages[0].content.type).toBe(
        EmailPayloadConstant.USER_CERTIFICATION,
      );
      expect((dlqMessages[0].content.data as { email: string }).email).toBe(
        'test@test.com',
      );
    });
  });
});
