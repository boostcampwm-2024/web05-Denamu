import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { CommentCreatedEvent } from '@comment/event/comment-created.event';
import { CommentDeletedEvent } from '@comment/event/comment-deleted.event';

import { WinstonLoggerService } from '@common/logger/logger.service';

import { FeedRepository } from '@feed/repository/feed.repository';

import { NotificationService } from '@notification/service/notification.service';

@Injectable()
export class CommentListener {
  constructor(
    private readonly feedRepository: FeedRepository,
    private readonly notificationService: NotificationService,
    private readonly logger: WinstonLoggerService,
  ) {}

  @OnEvent('comment.created')
  async handleCommentCreated({ feedId, commenterUserId }: CommentCreatedEvent) {
    try {
      const blogMeta = await this.feedRepository.getBlogMetaByFeedId(feedId);
      if (!blogMeta?.userId) return;
      if (blogMeta.userId === commenterUserId) return;

      await this.notificationService.upsertCommentNotification(
        blogMeta.userId,
        feedId,
      );
    } catch (error) {
      this.logger.error(
        `[CommentListener]: 댓글 알림 생성 중 오류 발생 (feedId: ${feedId}): ${error}`,
      );
    }
  }

  @OnEvent('comment.deleted')
  async handleCommentDeleted({ feedId }: CommentDeletedEvent) {
    try {
      const blogMeta = await this.feedRepository.getBlogMetaByFeedId(feedId);
      if (!blogMeta?.userId) return;

      await this.notificationService.removeCommentNotificationIfEmpty(
        feedId,
        blogMeta.userId,
      );
    } catch (error) {
      this.logger.error(
        `[CommentListener]: 댓글 알림 삭제 중 오류 발생 (feedId: ${feedId}): ${error}`,
      );
    }
  }
}
