import 'reflect-metadata';
import {
  EmailPayload,
  EmailPayloadConstant,
  RssRegistration,
  RssRemoval,
  User,
} from '@app-types/types';
import { EmailConsumer } from '@email/email.consumer';
import { RabbitmqService } from '@rabbitmq/rabbitmq.service';
import { EmailService } from '@email/email.service';
import { RETRY_CONFIG, RMQ_QUEUES } from '@rabbitmq/rabbitmq.constant';

describe('email consumer unit test', () => {
  let emailConsumer: EmailConsumer;
  let rabbitmqService: jest.Mocked<RabbitmqService>;
  let emailService: jest.Mocked<EmailService>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleEmailByType unit test', () => {
    beforeEach(() => {
      emailService = {
        sendUserCertificationMail: jest.fn().mockResolvedValue(undefined),
        sendRssMail: jest.fn().mockResolvedValue(undefined),
        sendRssRemoveCertificationMail: jest.fn().mockResolvedValue(undefined),
        sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
        sendDeleteAccountMail: jest.fn().mockResolvedValue(undefined),
      } as any;
      rabbitmqService = {
        sendMessageToQueue: jest.fn().mockResolvedValue(null),
      } as any;
      emailConsumer = new EmailConsumer(rabbitmqService, emailService);
    });

    it('USER_CERTIFICATION 타입일 때 sendUserCertificationMail을 호출한다', async () => {
      const userData: User = {
        email: 'test@test.com',
        userName: 'tester',
        uuid: 'test-uuid',
      };
      const payload: EmailPayload = {
        type: EmailPayloadConstant.USER_CERTIFICATION,
        data: userData,
      };

      await emailConsumer.handleEmailByType(payload);

      expect(emailService.sendUserCertificationMail).toHaveBeenCalledTimes(1);
      expect(emailService.sendUserCertificationMail).toHaveBeenCalledWith(
        userData,
      );
    });

    it('RSS_REGISTRATION 타입일 때 sendRssMail을 호출한다', async () => {
      const rssData: RssRegistration = {
        rss: {
          name: 'Test Blog',
          userName: 'tester',
          email: 'test@test.com',
          rssUrl: 'https://test.com/rss',
        },
        approveFlag: true,
        description: '승인되었습니다',
      };
      const payload: EmailPayload = {
        type: EmailPayloadConstant.RSS_REGISTRATION,
        data: rssData,
      };

      await emailConsumer.handleEmailByType(payload);

      expect(emailService.sendRssMail).toHaveBeenCalledTimes(1);
      expect(emailService.sendRssMail).toHaveBeenCalledWith(rssData);
    });

    it('RSS_REMOVAL 타입일 때 sendRssRemoveCertificationMail을 호출한다', async () => {
      const rssRemovalData: RssRemoval = {
        userName: 'tester',
        email: 'test@test.com',
        rssUrl: 'https://test.com/rss',
        certificateCode: 'cert-code-123',
      };
      const payload: EmailPayload = {
        type: EmailPayloadConstant.RSS_REMOVAL,
        data: rssRemovalData,
      };

      await emailConsumer.handleEmailByType(payload);

      expect(emailService.sendRssRemoveCertificationMail).toHaveBeenCalledTimes(
        1,
      );
      expect(emailService.sendRssRemoveCertificationMail).toHaveBeenCalledWith(
        rssRemovalData,
      );
    });

    it('PASSWORD_RESET 타입일 때 sendPasswordResetEmail을 호출한다', async () => {
      const userData: User = {
        email: 'test@test.com',
        userName: 'tester',
        uuid: 'reset-uuid',
      };
      const payload: EmailPayload = {
        type: EmailPayloadConstant.PASSWORD_RESET,
        data: userData,
      };

      await emailConsumer.handleEmailByType(payload);

      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        userData,
      );
    });

    it('ACCOUNT_DELETION 타입일 때 sendDeleteAccountMail을 호출한다', async () => {
      const userData: User = {
        email: 'test@test.com',
        userName: 'tester',
        uuid: 'delete-uuid',
      };
      const payload: EmailPayload = {
        type: EmailPayloadConstant.ACCOUNT_DELETION,
        data: userData,
      };

      await emailConsumer.handleEmailByType(payload);

      expect(emailService.sendDeleteAccountMail).toHaveBeenCalledTimes(1);
      expect(emailService.sendDeleteAccountMail).toHaveBeenCalledWith(userData);
    });

    it('알 수 없는 타입일 때 아무 메서드도 호출하지 않는다', async () => {
      const payload = {
        type: 'unknownType',
        data: {},
      } as any;

      await emailConsumer.handleEmailByType(payload);

      expect(emailService.sendUserCertificationMail).not.toHaveBeenCalled();
      expect(emailService.sendRssMail).not.toHaveBeenCalled();
      expect(
        emailService.sendRssRemoveCertificationMail,
      ).not.toHaveBeenCalled();
      expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(emailService.sendDeleteAccountMail).not.toHaveBeenCalled();
    });
  });

  describe('handleEmailByError unit test', () => {
    const networkErrors = [
      `ESOCKET`,
      `ECONNREFUSED`,
      `ETIMEDOUT`,
      `Unexpected socket close`,
    ];
    const commonSmtp4xxErrors = [
      {
        responseCode: 421,
        message: 'Service not available, closing transmission channel',
      },
      { responseCode: 450, message: 'Mailbox unavailable' },
      { responseCode: 451, message: 'Local error in processing' },
      { responseCode: 452, message: 'Insufficient system storage' },
    ];
    const commonSmtp5xxErrors = [
      { responseCode: 550, message: 'Mailbox unavailable' },
      { responseCode: 552, message: 'Exceeded storage allocation' },
      { responseCode: 554, message: 'Transaction failed' },
    ];
    beforeEach(() => {
      emailService = {} as any;
      rabbitmqService = {
        sendMessageToQueue: jest.fn().mockResolvedValue(null),
      } as any;
      emailConsumer = new EmailConsumer(rabbitmqService, emailService);
    });

    describe('Transient Error test', () => {
      networkErrors.forEach((errorName) => {
        it(`Node.js 네트워크 레벨의 ${errorName} 에러가 발생하면 재시도한다.`, async () => {
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
          expect(rabbitmqService.sendMessageToQueue).toHaveBeenCalledTimes(1);
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
          expect(rabbitmqService.sendMessageToQueue).toHaveBeenCalledTimes(1);
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

      describe('재시도 횟수에 따른 대기 큐 선택 검증', () => {
        const retryCountTestCases = [
          {
            retryCount: 0,
            expectedQueue: RETRY_CONFIG.WAITING_QUEUE[0],
            description: '5초 대기 큐',
          },
          {
            retryCount: 1,
            expectedQueue: RETRY_CONFIG.WAITING_QUEUE[1],
            description: '10초 대기 큐',
          },
          {
            retryCount: 2,
            expectedQueue: RETRY_CONFIG.WAITING_QUEUE[2],
            description: '20초 대기 큐',
          },
        ];

        retryCountTestCases.forEach(
          ({ retryCount, expectedQueue, description }) => {
            it(`네트워크 에러 발생 시 retryCount=${retryCount}이면 ${description}(${expectedQueue})로 메시지를 발행한다.`, async () => {
              //given
              const error = new Error('ECONNREFUSED') as any;
              const emailPayload: EmailPayload = {
                type: EmailPayloadConstant.USER_CERTIFICATION,
                data: {
                  email: `test@test.com`,
                  userName: `tester`,
                  uuid: `tester-uuid`,
                },
              };

              //when
              await emailConsumer.handleEmailByError(
                error,
                emailPayload,
                retryCount,
              );

              //then
              expect(rabbitmqService.sendMessageToQueue).toHaveBeenCalledTimes(
                1,
              );
              expect(rabbitmqService.sendMessageToQueue).toHaveBeenCalledWith(
                expectedQueue,
                JSON.stringify(emailPayload),
                {
                  headers: {
                    'x-retry-count': retryCount + 1,
                  },
                },
              );
            });

            it(`SMTP 4xx 에러 발생 시 retryCount=${retryCount}이면 ${description}(${expectedQueue})로 메시지를 발행한다.`, async () => {
              //given
              const error = new Error('Mailbox unavailable') as any;
              error.responseCode = 450;
              const emailPayload: EmailPayload = {
                type: EmailPayloadConstant.USER_CERTIFICATION,
                data: {
                  email: `test@test.com`,
                  userName: `tester`,
                  uuid: `tester-uuid`,
                },
              };

              //when
              await emailConsumer.handleEmailByError(
                error,
                emailPayload,
                retryCount,
              );

              //then
              expect(rabbitmqService.sendMessageToQueue).toHaveBeenCalledTimes(
                1,
              );
              expect(rabbitmqService.sendMessageToQueue).toHaveBeenCalledWith(
                expectedQueue,
                JSON.stringify(emailPayload),
                {
                  headers: {
                    'x-retry-count': retryCount + 1,
                  },
                },
              );
            });
          },
        );
      });
    });

    describe('Permanent Error test', () => {
      // SMTP 레벨의 500번대 에러
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
          expect(rabbitmqService.sendMessageToQueue).toHaveBeenCalledTimes(1);
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
        expect(rabbitmqService.sendMessageToQueue).toHaveBeenCalledTimes(1);
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

    describe('Transient Error 재시도 횟수 초과', () => {
      const allErrors = [...networkErrors, ...commonSmtp4xxErrors];
      allErrors.forEach((targetError) => {
        const errorName =
          typeof targetError === 'string'
            ? targetError
            : `SMTP ${targetError.responseCode}`;
        it(`${errorName} 에러에 대해 재시도 횟수가 ${RETRY_CONFIG.MAX_RETRY}회 이상이면 DLQ로 메시지를 발행한다.`, async () => {
          //given
          let error;
          if (typeof targetError === 'string') {
            error = new Error(`${targetError}`) as any;
            if (targetError === 'ESOCKET') {
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
          const retryCount = RETRY_CONFIG.MAX_RETRY;

          //when
          await emailConsumer.handleEmailByError(
            error,
            emailPayload,
            retryCount,
          );

          //then
          expect(rabbitmqService.sendMessageToQueue).toHaveBeenCalledTimes(1);
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
  });
});
