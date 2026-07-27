import { Module } from '@nestjs/common';

import { JwtAuthModule } from '@common/auth/jwt.module';

import { FeedModule } from '@feed/module/feed.module';

import { NotificationController } from '@notification/controller/notification.controller';
import { CommentListener } from '@notification/listener/comment.listener';
import { LikeListener } from '@notification/listener/like.listener';
import { NotificationRepository } from '@notification/repository/notification.repository';
import { NotificationScheduler } from '@notification/scheduler/notification.scheduler';
import { NotificationService } from '@notification/service/notification.service';

@Module({
  imports: [FeedModule, JwtAuthModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationRepository,
    LikeListener,
    CommentListener,
    NotificationScheduler,
  ],
  exports: [],
})
export class NotificationModule {}
