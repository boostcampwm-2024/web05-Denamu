import 'reflect-metadata';
import { EmailPayload, EmailPayloadConstant } from '../../src/types/types';
import { EmailConsumer } from '../../src/email/email.consumer';
import { RabbitmqService } from '../../src/rabbitmq/rabbitmq.service';
import { EmailService } from '../../src/email/email.service';
import { RETRY_CONFIG, RMQ_QUEUES } from '../../src/rabbitmq/rabbitmq.constant';

describe('email consumer unit test', () => {
  describe('handleEmailByError unit test', () => {
    let emailConsumer: EmailConsumer;
    let rabbitmqService: jest.Mocked<RabbitmqService>;
    let emailService: jest.Mocked<EmailService>;
    beforeEach(() => {
      emailService = {} as any;
      rabbitmqService = {
        sendMessageToQueue: jest.fn().mockResolvedValue(null),
      } as any;
      emailConsumer = new EmailConsumer(rabbitmqService, emailService);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('재시도 가능한 에러', () => {
      // Node.js 네트워크 레벨의 에러
      const networkErrors = [
        `ESOCKET`,
        `ECONNREFUSED`,
        `ETIMEDOUT`,
        `Unexpected socket close`,
      ];
      networkErrors.forEach((errorName) => {
        it(`Node.js 네트워크 레벨의 ${errorName}에러가 발생하면 재시도한다.`, async () => {
          //given
          const error = new Error(`${errorName}`) as any;
          if (errorName === 'ESOCKET') {
            error.code = 'ESOCKET';
          }
          const emailPayload: EmailPayload = {
            type: EmailPayloadConstant.USER_CERTIFICATION,
            data: {
              email: `test@test.com`,
              userName: `tester`,
              uuid: `tester-uuid`,
            },
          };
          const retryCount = 0;

          //when
          await emailConsumer.handleEmailByError(
            error,
            emailPayload,
            retryCount,
          );

          //then
          //1. 호출횟수 검증
          expect(rabbitmqService.sendMessageToQueue).toHaveBeenCalledTimes(1);

          //2. 입력 인자 검증
          expect(rabbitmqService.sendMessageToQueue).toHaveBeenCalledWith(
            RETRY_CONFIG.WAITING_QUEUE[0],
            JSON.stringify(emailPayload),
            {
              headers: {
                'x-retry-count': retryCount + 1,
              },
            },
          );
        });
      });

      // SMTP 레벨의 400번대 에러 검증
      const commonSmtp4xxErrors = [
        {
          responseCode: 421,
          message: 'Service not available, closing transmission channel',
        },
        { responseCode: 450, message: 'Mailbox unavailable' },
        { responseCode: 451, message: 'Local error in processing' },
        { responseCode: 452, message: 'Insufficient system storage' },
      ];
      commonSmtp4xxErrors.forEach(({ responseCode, message }) => {
        it(`SMTP ${responseCode} 에러가 발생하면 재시도한다.`, async () => {
          //given
          const error = new Error(`${message}`) as any;
          error.responseCode = responseCode;
          const emailPayload: EmailPayload = {
            type: EmailPayloadConstant.USER_CERTIFICATION,
            data: {
              email: `test@test.com`,
              userName: `tester`,
              uuid: `tester-uuid`,
            },
          };
          const retryCount = 0;

          //when
          await emailConsumer.handleEmailByError(
            error,
            emailPayload,
            retryCount,
          );

          //then
          //1. 호출횟수 검증
          expect(rabbitmqService.sendMessageToQueue).toHaveBeenCalledTimes(1);

          //2. 입력 인자 검증
          expect(rabbitmqService.sendMessageToQueue).toHaveBeenCalledWith(
            RETRY_CONFIG.WAITING_QUEUE[0],
            JSON.stringify(emailPayload),
            {
              headers: {
                'x-retry-count': retryCount + 1,
              },
            },
          );
        });
      });

      const allErrors = [...networkErrors, ...commonSmtp4xxErrors];
      allErrors.forEach((targetError) => {
        const errorName =
          typeof targetError === 'string'
            ? targetError
            : `SMTP ${targetError.responseCode}`;
        it(`${errorName} 에러에 대해 재시도 횟수가 3회 이상이면 DLQ로 메시지를 발행한다.`, async () => {
          //given
          let error;
          if (typeof targetError === 'string') {
            error = new Error(`${targetError}`) as any;
            if (errorName === 'ESOCKET') {
              error.code = 'ESOCKET';
            }
          } else {
            error = new Error(`${targetError.message}`) as any;
            error.responseCode = targetError.responseCode;
          }
          const emailPayload: EmailPayload = {
            type: EmailPayloadConstant.USER_CERTIFICATION,
            data: {
              email: `test@test.com`,
              userName: `tester`,
              uuid: `tester-uuid`,
            },
          };
          const retryCount = 3;

          //when
          await emailConsumer.handleEmailByError(
            error,
            emailPayload,
            retryCount,
          );

          //then
          //1. 호출횟수 검증
          expect(rabbitmqService.sendMessageToQueue).toHaveBeenCalledTimes(1);

          //2. 입력 인자 검증
          expect(rabbitmqService.sendMessageToQueue).toHaveBeenCalledWith(
            RMQ_QUEUES.EMAIL_DEAD_LETTER,
            JSON.stringify(emailPayload),
            expect.objectContaining({
              headers: expect.objectContaining({
                'x-retry-count': retryCount,
                'x-error-message': error.message,
                'x-failure-type': 'MAX_RETRIES_EXCEEDED',
              }),
            }),
          );
        });
      });
    });

    describe('영구적 실패, 즉시 DLQ로 발행되는 에러', () => {
      // SMTP 레벨의 500번대 에러
      const commonSmtp5xxErrors = [
        { responseCode: 550, message: 'Mailbox unavailable' },
        { responseCode: 552, message: 'Exceeded storage allocation' },
        { responseCode: 554, message: 'Transaction failed' },
      ];

      commonSmtp5xxErrors.forEach(({ responseCode, message }) => {
        it(`SMTP ${responseCode} 에러가 발생하면 DLQ로 메시지를 발행한다.`, async () => {
          //given
          const error = new Error(`${message}`) as any;
          error.responseCode = responseCode;
          const emailPayload: EmailPayload = {
            type: EmailPayloadConstant.USER_CERTIFICATION,
            data: {
              email: `test@test.com`,
              userName: `tester`,
              uuid: `tester-uuid`,
            },
          };
          const retryCount = 0;

          //when
          await emailConsumer.handleEmailByError(
            error,
            emailPayload,
            retryCount,
          );

          //then
          //1. 호출횟수 검증
          expect(rabbitmqService.sendMessageToQueue).toHaveBeenCalledTimes(1);

          //2. 입력 인자 검증
          expect(rabbitmqService.sendMessageToQueue).toHaveBeenCalledWith(
            RMQ_QUEUES.EMAIL_DEAD_LETTER,
            JSON.stringify(emailPayload),
            expect.objectContaining({
              headers: expect.objectContaining({
                'x-retry-count': retryCount,
                'x-error-message': message,
                'x-failure-type': 'SMTP_PERMANENT_FAILURE',
                'x-response-code': responseCode,
              }),
            }),
          );
        });
      });

      it(`알 수 없는 에러가 발생하면 DLQ로 메시지를 발행한다.`, async () => {
        const error = new Error(`Unknown error occurred.`);
        const emailPayload: EmailPayload = {
          type: EmailPayloadConstant.USER_CERTIFICATION,
          data: {
            email: `test@test.com`,
            userName: `tester`,
            uuid: `tester-uuid`,
          },
        };
        const retryCount = 0;

        //when
        await emailConsumer.handleEmailByError(error, emailPayload, retryCount);

        //then
        //1. 호출횟수 검증
        expect(rabbitmqService.sendMessageToQueue).toHaveBeenCalledTimes(1);

        //2. 입력 인자 검증
        expect(rabbitmqService.sendMessageToQueue).toHaveBeenCalledWith(
          RMQ_QUEUES.EMAIL_DEAD_LETTER,
          JSON.stringify(emailPayload),
          expect.objectContaining({
            headers: expect.objectContaining({
              'x-retry-count': retryCount,
              'x-error-code': 'UNKNOWN',
              'x-error-message': error.message,
              'x-failure-type': 'UNKNOWN_ERROR',
            }),
          }),
        );
      });
    });
  });
});
