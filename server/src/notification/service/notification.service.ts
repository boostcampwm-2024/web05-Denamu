import { Injectable, NotFoundException } from '@nestjs/common';

import { GetNotificationsResponseDto } from '@notification/dto/response/getNotifications.dto';
import { GetUnreadCountResponseDto } from '@notification/dto/response/getUnreadCount.dto';
import { NotificationRepository } from '@notification/repository/notification.repository';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async upsertLikeNotification(recipientId: number, feedId: number) {
    await this.notificationRepository.upsertLike(recipientId, feedId);
  }

  async removeLikeNotificationIfEmpty(feedId: number, likeCount: number) {
    if (likeCount > 0) return;
    await this.notificationRepository.deleteLikeNotification(feedId);
  }

  async upsertCommentNotification(recipientId: number, feedId: number) {
    await this.notificationRepository.upsertComment(recipientId, feedId);
  }

  async removeCommentNotificationIfEmpty(feedId: number, recipientId: number) {
    const hasOtherComment =
      await this.notificationRepository.hasActiveOtherComment(
        feedId,
        recipientId,
      );
    if (hasOtherComment) return;
    await this.notificationRepository.deleteCommentNotification(feedId);
  }

  async upsertSubscribeNotification(recipientId: number, rssAcceptId: number) {
    await this.notificationRepository.upsertSubscribe(recipientId, rssAcceptId);
  }

  async removeSubscribeNotificationIfEmpty(
    rssAcceptId: number,
    subscriberCount: number,
  ) {
    if (subscriberCount > 0) return;
    await this.notificationRepository.deleteSubscribeNotification(rssAcceptId);
  }

  async getUnreadCount(userId: number) {
    const count = await this.notificationRepository.countUnread(userId);
    return GetUnreadCountResponseDto.toResponseDto(count);
  }

  async getNotifications(userId: number, limit: number) {
    const rows = await this.notificationRepository.findByRecipient(
      userId,
      limit,
    );
    return GetNotificationsResponseDto.toResponseDto(rows);
  }

  async markAsRead(notificationId: number, userId: number) {
    const updated = await this.notificationRepository.markRead(
      notificationId,
      userId,
    );
    if (!updated) {
      throw new NotFoundException('존재하지 않거나 접근할 수 없는 알림입니다.');
    }
  }

  async deleteExpired() {
    await this.notificationRepository.deleteExpired();
  }
}
