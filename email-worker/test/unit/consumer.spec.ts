import 'reflect-metadata';

import {
  AdminCertification,
  MarketingBroadcast,
  RssCertification,
  RssRegistration,
  RssRegistrationRequest,
  RssRemoval,
  UnreadNotificationDigest,
  User,
} from '@common/types';

import { EmailPayloadConstant } from '@email/constant';
import { EmailConsumer } from '@email/email.consumer';
import { EmailService } from '@email/email.service';
import { EmailPayload, NodeMailerError } from '@email/types';

import { NOTIFICATION_EVENT } from '@notification/notification-event.constant';
import { Notifier } from '@notification/notifier.interface';

import { RETRY_CONFIG, RMQ_QUEUES } from '@rabbitmq/rabbitmq.constant';
import { RabbitMQService } from '@rabbitmq/rabbitmq.service';

describe('email consumer unit test', () => {
  let emailConsumer: EmailConsumer;
  let rabbitmqService: jest.Mocked<RabbitMQService>;
  let emailService: jest.Mocked<EmailService>;
  let notifier: jest.Mocked<Notifier>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleEmailByType unit test', () => {
    let sendUserCertificationMail: jest.Mock;
    let sendRssMail: jest.Mock;
    let sendRssRemoveCertificationMail: jest.Mock;
    let sendRssCertificationMail: jest.Mock;
    let sendPasswordResetEmail: jest.Mock;
    let sendDeleteAccountMail: jest.Mock;
    let sendRssRegistrationRequestMail: jest.Mock;
    let sendAdminCertificationMail: jest.Mock;
    let sendAdminDeleteAccountMail: jest.Mock;
    let sendAdminPasswordResetEmail: jest.Mock;
    let sendMarketingBroadcastMail: jest.Mock;
    let sendUnreadNotificationDigestMail: jest.Mock;

    beforeEach(() => {
      sendUserCertificationMail = jest.fn().mockResolvedValue(undefined);
      sendRssMail = jest.fn().mockResolvedValue(undefined);
      sendRssRemoveCertificationMail = jest.fn().mockResolvedValue(undefined);
      sendRssCertificationMail = jest.fn().mockResolvedValue(undefined);
      sendPasswordResetEmail = jest.fn().mockResolvedValue(undefined);
      sendDeleteAccountMail = jest.fn().mockResolvedValue(undefined);
      sendRssRegistrationRequestMail = jest.fn().mockResolvedValue(undefined);
      sendAdminCertificationMail = jest.fn().mockResolvedValue(undefined);
      sendAdminDeleteAccountMail = jest.fn().mockResolvedValue(undefined);
      sendAdminPasswordResetEmail = jest.fn().mockResolvedValue(undefined);
      sendMarketingBroadcastMail = jest.fn().mockResolvedValue(undefined);
      sendUnreadNotificationDigestMail = jest.fn().mockResolvedValue(undefined);

      emailService = {
        sendUserCertificationMail,
        sendRssMail,
        sendRssRemoveCertificationMail,
        sendRssCertificationMail,
        sendPasswordResetEmail,
        sendDeleteAccountMail,
        sendRssRegistrationRequestMail,
        sendAdminCertificationMail,
        sendAdminDeleteAccountMail,
        sendAdminPasswordResetEmail,
        sendMarketingBroadcastMail,
        sendUnreadNotificationDigestMail,
      } as any;
      rabbitmqService = {
        sendMessageToQueue: jest.fn().mockResolvedValue(null),
      } as any;
      notifier = {
        start: jest.fn(),
        publish: jest.fn(),
      };
      emailConsumer = new EmailConsumer(
        rabbitmqService,
        emailService,
        notifier,
      );
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

      expect(sendUserCertificationMail).toHaveBeenCalledTimes(1);
      expect(sendUserCertificationMail).toHaveBeenCalledWith(userData);
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

      expect(sendRssMail).toHaveBeenCalledTimes(1);
      expect(sendRssMail).toHaveBeenCalledWith(rssData);
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

      expect(sendRssRemoveCertificationMail).toHaveBeenCalledTimes(1);
      expect(sendRssRemoveCertificationMail).toHaveBeenCalledWith(
        rssRemovalData,
      );
    });

    it('RSS_CERTIFICATION 타입일 때 sendRssCertificationMail을 호출한다', async () => {
      const rssCertificationData: RssCertification = {
        userName: 'tester',
        email: 'test@test.com',
        blogName: 'Test Blog',
        certificateCode: 'cert-code-123',
        userEmail: 'requester@test.com',
      };
      const payload: EmailPayload = {
        type: EmailPayloadConstant.RSS_CERTIFICATION,
        data: rssCertificationData,
      };

      await emailConsumer.handleEmailByType(payload);

      expect(sendRssCertificationMail).toHaveBeenCalledTimes(1);
      expect(sendRssCertificationMail).toHaveBeenCalledWith(
        rssCertificationData,
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

      expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(userData);
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

      expect(sendDeleteAccountMail).toHaveBeenCalledTimes(1);
      expect(sendDeleteAccountMail).toHaveBeenCalledWith(userData);
    });

    it('RSS_REGISTRATION_REQUEST 타입일 때 sendRssRegistrationRequestMail을 호출한다', async () => {
      const requestData: RssRegistrationRequest = {
        rss: {
          name: 'Test Blog',
          userName: 'tester',
          email: 'test@test.com',
          rssUrl: 'https://test.com/rss',
        },
        adminEmail: 'admin@test.com',
      };
      const payload: EmailPayload = {
        type: EmailPayloadConstant.RSS_REGISTRATION_REQUEST,
        data: requestData,
      };

      await emailConsumer.handleEmailByType(payload);

      expect(sendRssRegistrationRequestMail).toHaveBeenCalledTimes(1);
      expect(sendRssRegistrationRequestMail).toHaveBeenCalledWith(requestData);
    });

    it('ADMIN_CERTIFICATION 타입일 때 sendAdminCertificationMail을 호출한다', async () => {
      const adminData: AdminCertification = {
        email: 'admin@test.com',
        name: 'admin',
        uuid: 'admin-uuid',
      };
      const payload: EmailPayload = {
        type: EmailPayloadConstant.ADMIN_CERTIFICATION,
        data: adminData,
      };

      await emailConsumer.handleEmailByType(payload);

      expect(sendAdminCertificationMail).toHaveBeenCalledTimes(1);
      expect(sendAdminCertificationMail).toHaveBeenCalledWith(adminData);
    });

    it('ADMIN_ACCOUNT_DELETION 타입일 때 sendAdminDeleteAccountMail을 호출한다', async () => {
      const adminData: AdminCertification = {
        email: 'admin@test.com',
        name: 'admin',
        uuid: 'admin-uuid',
      };
      const payload: EmailPayload = {
        type: EmailPayloadConstant.ADMIN_ACCOUNT_DELETION,
        data: adminData,
      };

      await emailConsumer.handleEmailByType(payload);

      expect(sendAdminDeleteAccountMail).toHaveBeenCalledTimes(1);
      expect(sendAdminDeleteAccountMail).toHaveBeenCalledWith(adminData);
    });

    it('ADMIN_PASSWORD_RESET 타입일 때 sendAdminPasswordResetEmail을 호출한다', async () => {
      const adminData: AdminCertification = {
        email: 'admin@test.com',
        name: 'admin',
        uuid: 'admin-uuid',
      };
      const payload: EmailPayload = {
        type: EmailPayloadConstant.ADMIN_PASSWORD_RESET,
        data: adminData,
      };

      await emailConsumer.handleEmailByType(payload);

      expect(sendAdminPasswordResetEmail).toHaveBeenCalledTimes(1);
      expect(sendAdminPasswordResetEmail).toHaveBeenCalledWith(adminData);
    });

    it('MARKETING_BROADCAST 타입일 때 sendMarketingBroadcastMail을 호출한다', async () => {
      //given
      const marketingData: MarketingBroadcast = {
        email: 'test@test.com',
        userName: 'tester',
        subject: '9월 신규 기능 소식',
        content: '<p>이번 달 업데이트를 확인해보세요.</p>',
      };
      const payload: EmailPayload = {
        type: EmailPayloadConstant.MARKETING_BROADCAST,
        data: marketingData,
      };

      //when
      await emailConsumer.handleEmailByType(payload);

      //then
      expect(sendMarketingBroadcastMail).toHaveBeenCalledTimes(1);
      expect(sendMarketingBroadcastMail).toHaveBeenCalledWith(marketingData);
    });

    it('UNREAD_NOTIFICATION_DIGEST 타입일 때 sendUnreadNotificationDigestMail을 호출한다', async () => {
      const digestData: UnreadNotificationDigest = {
        email: 'test@test.com',
        userName: 'tester',
        unreadCount: 5,
      };
      const payload: EmailPayload = {
        type: EmailPayloadConstant.UNREAD_NOTIFICATION_DIGEST,
        data: digestData,
      };

      await emailConsumer.handleEmailByType(payload);

      expect(sendUnreadNotificationDigestMail).toHaveBeenCalledTimes(1);
      expect(sendUnreadNotificationDigestMail).toHaveBeenCalledWith(
        digestData,
      );
    });

    it('알 수 없는 타입일 때 아무 메서드도 호출하지 않는다', async () => {
      const payload = {
        type: 'unknownType',
        data: {},
      } as any;

      await emailConsumer.handleEmailByType(payload);

      expect(sendUserCertificationMail).not.toHaveBeenCalled();
      expect(sendRssMail).not.toHaveBeenCalled();
      expect(sendRssRemoveCertificationMail).not.toHaveBeenCalled();
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(sendDeleteAccountMail).not.toHaveBeenCalled();
    });
  });

  describe('handleEmailByError unit test', () => {
    let sendMessageToQueue: jest.Mock;
    let notifierPublish: jest.Mock;

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
      sendMessageToQueue = jest.fn().mockResolvedValue(null);
      rabbitmqService = {
        sendMessageToQueue,
      } as any;
      notifierPublish = jest.fn();
      notifier = {
        start: jest.fn(),
        publish: notifierPublish,
      };
      emailConsumer = new EmailConsumer(
        rabbitmqService,
        emailService,
        notifier,
      );
    });

    describe('Transient Error test', () => {
      networkErrors.forEach((errorName) => {
        it(`Node.js 네트워크 레벨의 ${errorName} 에러가 발생하면 재시도한다.`, async () => {
          //given
          const error = new Error(`${errorName}`) as NodeMailerError;
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
          expect(sendMessageToQueue).toHaveBeenCalledTimes(1);
          expect(sendMessageToQueue).toHaveBeenCalledWith(
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
          const error = new Error(`${message}`) as NodeMailerError;
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
          expect(sendMessageToQueue).toHaveBeenCalledTimes(1);
          expect(sendMessageToQueue).toHaveBeenCalledWith(
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
              expect(sendMessageToQueue).toHaveBeenCalledTimes(1);
              expect(sendMessageToQueue).toHaveBeenCalledWith(
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
              const error = new Error('Mailbox unavailable') as NodeMailerError;
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
              expect(sendMessageToQueue).toHaveBeenCalledTimes(1);
              expect(sendMessageToQueue).toHaveBeenCalledWith(
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
          const error = new Error(`${message}`) as NodeMailerError;
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
          expect(sendMessageToQueue).toHaveBeenCalledTimes(1);
          expect(sendMessageToQueue).toHaveBeenCalledWith(
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
        expect(sendMessageToQueue).toHaveBeenCalledTimes(1);
        expect(sendMessageToQueue).toHaveBeenCalledWith(
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

      it('DLQ 발행 시 notifier로 EMAIL_DLQ 이벤트를 발행한다', async () => {
        const error = new Error('Mailbox unavailable') as NodeMailerError;
        error.responseCode = 550;
        const emailPayload: EmailPayload = {
          type: EmailPayloadConstant.USER_CERTIFICATION,
          data: {
            email: `test@test.com`,
            userName: `tester`,
            uuid: `tester-uuid`,
          },
        };

        await emailConsumer.handleEmailByError(error, emailPayload, 0);

        expect(notifierPublish).toHaveBeenCalledTimes(1);
        expect(notifierPublish).toHaveBeenCalledWith(
          NOTIFICATION_EVENT.EMAIL_DLQ,
          expect.objectContaining({ error }),
        );
      });

      it('재시도 가능한 에러는 notifier로 이벤트를 발행하지 않는다', async () => {
        const error = new Error('ECONNREFUSED') as NodeMailerError;
        const emailPayload: EmailPayload = {
          type: EmailPayloadConstant.USER_CERTIFICATION,
          data: {
            email: `test@test.com`,
            userName: `tester`,
            uuid: `tester-uuid`,
          },
        };

        await emailConsumer.handleEmailByError(error, emailPayload, 0);

        expect(notifierPublish).not.toHaveBeenCalled();
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
          let error: NodeMailerError;
          if (typeof targetError === 'string') {
            error = new Error(`${targetError}`);
            if (targetError === 'ESOCKET') {
              error.code = 'ESOCKET';
            }
          } else {
            error = new Error(`${targetError.message}`);
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
          expect(sendMessageToQueue).toHaveBeenCalledTimes(1);
          expect(sendMessageToQueue).toHaveBeenCalledWith(
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

  describe('lifecycle unit test', () => {
    let consumeMessage: jest.Mock;
    let closeConsumer: jest.Mock;
    let sendUserCertificationMail: jest.Mock;
    let capturedCallback: (
      payload: EmailPayload,
      retryCount: number,
    ) => Promise<void>;

    const payload: EmailPayload = {
      type: EmailPayloadConstant.USER_CERTIFICATION,
      data: { email: 'test@test.com', userName: 'tester', uuid: 'tester-uuid' },
    };

    beforeEach(() => {
      consumeMessage = jest.fn().mockImplementation((_queue, callback) => {
        capturedCallback = callback;
        return Promise.resolve('test-consumer-tag');
      });
      closeConsumer = jest.fn().mockResolvedValue(undefined);
      sendUserCertificationMail = jest.fn().mockResolvedValue(undefined);

      rabbitmqService = {
        consumeMessage,
        closeConsumer,
        sendMessageToQueue: jest.fn().mockResolvedValue(null),
      } as any;
      emailService = { sendUserCertificationMail } as any;
      notifier = { start: jest.fn(), publish: jest.fn() };
      emailConsumer = new EmailConsumer(
        rabbitmqService,
        emailService,
        notifier,
      );
    });

    it('start 호출 시 EMAIL_SEND 큐를 consume 한다', async () => {
      await emailConsumer.start();

      expect(consumeMessage).toHaveBeenCalledTimes(1);
      expect(consumeMessage).toHaveBeenCalledWith(
        RMQ_QUEUES.EMAIL_SEND,
        expect.any(Function),
      );
    });

    it('consume 콜백이 정상 메시지를 받으면 handleEmailByType을 호출한다', async () => {
      await emailConsumer.start();

      await capturedCallback(payload, 0);

      expect(sendUserCertificationMail).toHaveBeenCalledWith(payload.data);
    });

    it('consume 콜백 처리 중 에러가 나면 handleEmailByError로 위임한다', async () => {
      const error = new Error('ECONNREFUSED');
      sendUserCertificationMail.mockRejectedValueOnce(error);
      const handleErrorSpy = jest.spyOn(emailConsumer, 'handleEmailByError');
      await emailConsumer.start();

      await capturedCallback(payload, 0);

      expect(handleErrorSpy).toHaveBeenCalledWith(error, payload, 0);
    });

    it('shutdown 중에는 새 메시지를 처리하지 않고 SHUTDOWN_IN_PROGRESS를 던진다', async () => {
      await emailConsumer.start();
      await emailConsumer.stopConsuming();

      await expect(capturedCallback(payload, 0)).rejects.toThrow(
        'SHUTDOWN_IN_PROGRESS',
      );
      expect(sendUserCertificationMail).not.toHaveBeenCalled();
    });

    it('stopConsuming은 consumerTag로 consumer를 취소한다', async () => {
      await emailConsumer.start();

      await emailConsumer.stopConsuming();

      expect(closeConsumer).toHaveBeenCalledWith('test-consumer-tag');
    });

    it('대기 중인 작업이 없으면 waitForPendingTasks는 즉시 반환한다', async () => {
      await expect(
        emailConsumer.waitForPendingTasks(),
      ).resolves.toBeUndefined();
    });

    it('stop은 진행 중인 작업이 모두 끝날 때까지 대기한 후 종료한다', async () => {
      // waitForPendingTasks의 10초 타임아웃 타이머 누수를 막기 위해 fake timer 사용
      jest.useFakeTimers();
      try {
        const flushMicrotasks = async () => {
          for (let i = 0; i < 5; i++) await Promise.resolve();
        };
        let resolveSend: () => void;
        sendUserCertificationMail.mockReturnValueOnce(
          new Promise<void>((resolve) => {
            resolveSend = resolve;
          }),
        );
        await emailConsumer.start();

        // 작업 시작 (아직 완료되지 않음 → pendingTasks=1)
        const taskPromise = capturedCallback(payload, 0);
        await flushMicrotasks();

        // stop 시작 → consumer 취소 후 작업 완료 대기 상태
        let stopped = false;
        const stopPromise = emailConsumer.stop().then(() => {
          stopped = true;
        });
        await flushMicrotasks();
        expect(stopped).toBe(false);

        // 작업 완료 → drain 후 stop 완료
        resolveSend();
        await taskPromise;
        await flushMicrotasks();
        await stopPromise;

        expect(stopped).toBe(true);
        expect(closeConsumer).toHaveBeenCalled();
      } finally {
        jest.clearAllTimers();
        jest.useRealTimers();
      }
    });

    it('대기 시간이 초과되면 강제로 종료된다', async () => {
      jest.useFakeTimers();
      try {
        sendUserCertificationMail.mockReturnValueOnce(new Promise(() => {}));
        await emailConsumer.start();

        void capturedCallback(payload, 0);
        await Promise.resolve();

        const waitPromise = emailConsumer.waitForPendingTasks();
        jest.advanceTimersByTime(10000);

        await expect(waitPromise).resolves.toBeUndefined();
      } finally {
        jest.clearAllTimers();
        jest.useRealTimers();
      }
    });

    it('close는 shutdown 중이 아니고 consumerTag가 있으면 consume을 중지한다', async () => {
      await emailConsumer.start();

      await emailConsumer.close();

      expect(closeConsumer).toHaveBeenCalledWith('test-consumer-tag');
    });
  });
});
