import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { EmailProducer } from '@common/email/email.producer';
import { WinstonLoggerService } from '@common/logger/logger.service';
import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { NotificationService } from '@notification/service/notification.service';

const DIGEST_LOCK_TTL_SECONDS = 3600;

@Injectable()
export class NotificationScheduler {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly emailProducer: EmailProducer,
    private readonly redisService: RedisService,
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

  @Cron('0 16 * * 5')
  async sendUnreadNotificationDigest() {
    const lockKey = `${REDIS_KEYS.NOTIFICATION_DIGEST_LOCK}:${new Date().toISOString().slice(0, 10)}`;
    const acquired = await this.redisService.set(
      lockKey,
      '1',
      'NX',
      'EX',
      DIGEST_LOCK_TTL_SECONDS,
    );
    
    if (!acquired) {
      this.logger.log(
        '[NotificationScheduler]: 다른 인스턴스가 이미 다이제스트를 발행 중 - 건너뜀.',
      );
      return;
    }

    try {
      const targets =
        await this.notificationService.getStaleUnreadDigestTargets();

      const results = await Promise.allSettled(
        targets.map((target) =>
          this.emailProducer.produceUnreadNotificationDigest(target),
        ),
      );

      const failures = results.filter(
        (r): r is PromiseRejectedResult => r.status === 'rejected',
      );
      if (failures.length > 0) {
        this.logger.error(
          `[NotificationScheduler]: 미읽음 알림 다이제스트 발행 실패 사유: ${failures
            .map((f) => f.reason)
            .join(', ')}`,
        );
      }
      this.logger.log(
        `[NotificationScheduler]: 미읽음 알림 다이제스트 발행 완료 (대상 ${targets.length}명, 실패 ${failures.length}건).`,
      );
    } catch (error) {
      this.logger.error(
        `[NotificationScheduler]: 미읽음 알림 다이제스트 발행 중 오류 발생: ${error}`,
      );
    }
  }
}
