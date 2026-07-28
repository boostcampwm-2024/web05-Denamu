import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { WinstonLoggerService } from '@common/logger/logger.service';

import { NotificationService } from '@notification/service/notification.service';

import { SubscriptionCreatedEvent } from '@subscribe/event/subscription-created.event';
import { SubscriptionDeletedEvent } from '@subscribe/event/subscription-deleted.event';
import { SubscriptionRepository } from '@subscribe/repository/subscription.repository';

@Injectable()
export class SubscriptionListener {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly notificationService: NotificationService,
    private readonly logger: WinstonLoggerService,
  ) {}

  @OnEvent('subscription.created')
  async handleSubscriptionCreated({
    rssId,
    ownerUserId,
  }: SubscriptionCreatedEvent) {
    try {
      if (!ownerUserId) return;

      await this.notificationService.upsertSubscribeNotification(
        ownerUserId,
        rssId,
      );
    } catch (error) {
      this.logger.error(
        `[SubscriptionListener]: 구독 알림 생성 중 오류 발생 (rssId: ${rssId}): ${error}`,
      );
    }
  }

  @OnEvent('subscription.deleted')
  async handleSubscriptionDeleted({ rssId }: SubscriptionDeletedEvent) {
    try {
      const subscriberCount =
        await this.subscriptionRepository.countByBlogId(rssId);
      await this.notificationService.removeSubscribeNotificationIfEmpty(
        rssId,
        subscriberCount,
      );
    } catch (error) {
      this.logger.error(
        `[SubscriptionListener]: 구독 알림 삭제 중 오류 발생 (rssId: ${rssId}): ${error}`,
      );
    }
  }
}
