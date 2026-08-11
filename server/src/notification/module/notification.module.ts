import { Module } from '@nestjs/common';

import { JwtAuthModule } from '@common/auth/jwt.module';

import { FeedModule } from '@feed/module/feed.module';

import { NewPostConsumer } from '@notification/consumer/newPost.consumer';
import { NotificationController } from '@notification/controller/notification.controller';
import { CommentListener } from '@notification/listener/comment.listener';
import { LikeListener } from '@notification/listener/like.listener';
import { SubscriptionListener } from '@notification/listener/subscription.listener';
import { NotificationRepository } from '@notification/repository/notification.repository';
import { NotificationScheduler } from '@notification/scheduler/notification.scheduler';
import { NotificationService } from '@notification/service/notification.service';

import { SubscriptionRepository } from '@subscribe/repository/subscription.repository';

@Module({
  imports: [FeedModule, JwtAuthModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationRepository,
    LikeListener,
    CommentListener,
    SubscriptionListener,
    SubscriptionRepository,
    NotificationScheduler,
    NewPostConsumer,
  ],
  exports: [],
})
export class NotificationModule {}
