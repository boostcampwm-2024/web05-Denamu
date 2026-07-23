import { Module } from '@nestjs/common';

import { ActivityModule } from '@activity/module/activity.module';

import { JwtAuthModule } from '@common/auth/jwt.module';

import { RssBlockRepository } from '@block/repository/rssBlock.repository';

import { FeedController } from '@feed/controller/feed.controller';
import { FeedViewedListener } from '@feed/listener/feed-viewed.listener';
import {
  FeedRepository,
  FeedViewRepository,
} from '@feed/repository/feed.repository';
import { FeedScheduler } from '@feed/scheduler/feed.scheduler';
import { FeedService } from '@feed/service/feed.service';

import { SubscriptionRepository } from '@subscribe/repository/subscription.repository';

import { UserModule } from '@user/module/user.module';

@Module({
  imports: [UserModule, ActivityModule, JwtAuthModule],
  controllers: [FeedController],
  providers: [
    FeedService,
    FeedRepository,
    FeedViewRepository,
    FeedScheduler,
    FeedViewedListener,
    SubscriptionRepository,
    RssBlockRepository,
  ],
  exports: [FeedRepository, FeedService],
})
export class FeedModule {}
