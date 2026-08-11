import { Injectable, NotFoundException } from '@nestjs/common';

import {
  getDigestStaleCutoffDate,
  getNotificationCutoffDate,
} from '@notification/constant/notification.constant';
import { GetNotificationsResponseDto } from '@notification/dto/response/getNotifications.dto';
import { GetUnreadCountResponseDto } from '@notification/dto/response/getUnreadCount.dto';
import { NotificationRepository } from '@notification/repository/notification.repository';

import { SubscriptionRepository } from '@subscribe/repository/subscription.repository';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
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

  async upsertReplyNotification(recipientId: number, feedId: number) {
    await this.notificationRepository.upsertReply(recipientId, feedId);
  }

  async removeReplyNotificationIfEmpty(feedId: number, recipientId: number) {
    const hasOtherReply = await this.notificationRepository.hasActiveOtherReply(
      feedId,
      recipientId,
    );
    if (hasOtherReply) return;
    await this.notificationRepository.deleteReplyNotification(
      feedId,
      recipientId,
    );
  }

  async upsertSubscribeNotification(recipientId: number, rssAcceptId: number) {
    await this.notificationRepository.upsertSubscribe(recipientId, rssAcceptId);
  }

  async upsertNewPostNotifications(rssAcceptId: number, feedId: number) {
    const subscriberIds =
      await this.subscriptionRepository.getSubscriberIdsByBlog(rssAcceptId);
    if (!subscriberIds.length) return;

    await this.notificationRepository.upsertNewPost(feedId, subscriberIds);
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

  async getStaleUnreadDigestTargets() {
    const rows = await this.notificationRepository.findStaleUnreadDigestTargets(
      getDigestStaleCutoffDate(),
      getNotificationCutoffDate(),
    );
    return rows.map((row) => ({
      email: row.email,
      userName: row.userName,
      unreadCount: Number(row.unreadCount),
    }));
  }
}
