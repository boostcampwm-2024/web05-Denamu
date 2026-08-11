import { Module } from '@nestjs/common';

import { ActivityModule } from '@activity/module/activity.module';

import { RssBlockRepository } from '@block/repository/rssBlock.repository';

import { JwtAuthModule } from '@common/auth/jwt.module';

import { AdminFeedController } from '@feed/controller/adminFeed.controller';
import { FeedController } from '@feed/controller/feed.controller';
import { FeedViewedListener } from '@feed/listener/feed-viewed.listener';
import { FeedRecentListener } from '@feed/listener/feedRecent.listener';
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
  controllers: [FeedController, AdminFeedController],
  providers: [
    FeedService,
    FeedRepository,
    FeedViewRepository,
    FeedScheduler,
    FeedViewedListener,
    FeedRecentListener,
    SubscriptionRepository,
    RssBlockRepository,
  ],
  exports: [FeedRepository, FeedService],
})
export class FeedModule {}
