import { SubscriptionListener } from '@notification/listener/subscription.listener';
import { NotificationService } from '@notification/service/notification.service';

import { WinstonLoggerService } from '@common/logger/logger.service';

import { SubscriptionCreatedEvent } from '@subscribe/event/subscription-created.event';
import { SubscriptionDeletedEvent } from '@subscribe/event/subscription-deleted.event';
import { SubscriptionRepository } from '@subscribe/repository/subscription.repository';

describe(`${SubscriptionListener.name} Unit Test`, () => {
  let subscriptionListener: SubscriptionListener;
  let subscriptionRepository: jest.Mocked<Pick<SubscriptionRepository, 'countByBlogId'>>;
  let notificationService: jest.Mocked<
    Pick<
      NotificationService,
      'upsertSubscribeNotification' | 'removeSubscribeNotificationIfEmpty'
    >
  >;
  let logger: jest.Mocked<Pick<WinstonLoggerService, 'error'>>;

  beforeEach(() => {
    subscriptionRepository = { countByBlogId: jest.fn() };
    notificationService = {
      upsertSubscribeNotification: jest.fn(),
      removeSubscribeNotificationIfEmpty: jest.fn(),
    };
    logger = { error: jest.fn() };

    subscriptionListener = new SubscriptionListener(
      subscriptionRepository as unknown as SubscriptionRepository,
      notificationService as unknown as NotificationService,
      logger as unknown as WinstonLoggerService,
    );
  });

  describe('handleSubscriptionCreated', () => {
    it('RSS 소유자가 없으면 알림을 생성하지 않는다.', async () => {
      // when
      await subscriptionListener.handleSubscriptionCreated(
        new SubscriptionCreatedEvent(10, 2, null),
      );

      // then
      expect(notificationService.upsertSubscribeNotification).not.toHaveBeenCalled();
    });

    it('RSS 소유자가 있으면 소유자에게 알림을 upsert한다.', async () => {
      // when
      await subscriptionListener.handleSubscriptionCreated(
        new SubscriptionCreatedEvent(10, 2, 99),
      );

      // then
      expect(notificationService.upsertSubscribeNotification).toHaveBeenCalledWith(99, 10);
    });

    it('처리 중 예외가 발생해도 던지지 않고 로깅한다.', async () => {
      // given
      notificationService.upsertSubscribeNotification.mockRejectedValue(new Error('db down'));

      // when & then
      await expect(
        subscriptionListener.handleSubscriptionCreated(
          new SubscriptionCreatedEvent(10, 2, 99),
        ),
      ).resolves.toBeUndefined();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('handleSubscriptionDeleted', () => {
    it('현재 구독자 수 기준으로 알림 삭제 여부를 위임한다.', async () => {
      // given
      subscriptionRepository.countByBlogId.mockResolvedValue(0);

      // when
      await subscriptionListener.handleSubscriptionDeleted(
        new SubscriptionDeletedEvent(10, 2),
      );

      // then
      expect(subscriptionRepository.countByBlogId).toHaveBeenCalledWith(10);
      expect(notificationService.removeSubscribeNotificationIfEmpty).toHaveBeenCalledWith(10, 0);
    });
  });
});
