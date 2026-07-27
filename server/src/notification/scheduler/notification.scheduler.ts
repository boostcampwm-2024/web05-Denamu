import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { WinstonLoggerService } from '@common/logger/logger.service';

import { NotificationService } from '@notification/service/notification.service';

@Injectable()
export class NotificationScheduler {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly logger: WinstonLoggerService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async removeExpiredNotifications() {
    try {
      await this.notificationService.deleteExpired();
      this.logger.log('[NotificationScheduler]: 만료된 알림 삭제 완료.');
    } catch (error) {
      this.logger.error(
        `[NotificationScheduler]: 만료 알림 삭제 중 오류 발생: ${error}`,
      );
    }
  }
}
