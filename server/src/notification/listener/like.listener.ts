import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { WinstonLoggerService } from '@common/logger/logger.service';

import { FeedRepository } from '@feed/repository/feed.repository';

import { LikeCreatedEvent } from '@like/event/like-created.event';
import { LikeDeletedEvent } from '@like/event/like-deleted.event';

import { NotificationService } from '@notification/service/notification.service';

@Injectable()
export class LikeListener {
  constructor(
    private readonly feedRepository: FeedRepository,
    private readonly notificationService: NotificationService,
    private readonly logger: WinstonLoggerService,
  ) {}

  @OnEvent('like.created')
  async handleLikeCreated({ feedId, likerUserId }: LikeCreatedEvent) {
    try {
      const blogMeta = await this.feedRepository.getBlogMetaByFeedId(feedId);
      if (!blogMeta?.userId) return;
      if (blogMeta.userId === likerUserId) return;

      await this.notificationService.upsertLikeNotification(blogMeta.userId, feedId);
    } catch (error) {
      this.logger.error(
        `[LikeListener]: 좋아요 알림 생성 중 오류 발생 (feedId: ${feedId}): ${error}`,
      );
    }
  }

  @OnEvent('like.deleted')
  async handleLikeDeleted({ feedId }: LikeDeletedEvent) {
    try {
      const feed = await this.feedRepository.findOneBy({ id: feedId });
      if (!feed) return;

      await this.notificationService.removeLikeNotificationIfEmpty(feedId, feed.likeCount);
    } catch (error) {
      this.logger.error(
        `[LikeListener]: 좋아요 알림 삭제 중 오류 발생 (feedId: ${feedId}): ${error}`,
      );
    }
  }
}
