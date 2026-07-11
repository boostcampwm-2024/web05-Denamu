import { Module } from '@nestjs/common';

import { JwtAuthModule } from '@common/auth/jwt.module';

import { FeedModule } from '@feed/module/feed.module';

import { RssModule } from '@rss/module/rss.module';

import { SubscriptionController } from '@subscribe/controller/subscription.controller';
import { UserSubscriptionController } from '@subscribe/controller/userSubscription.controller';
import { SubscriptionRepository } from '@subscribe/repository/subscription.repository';
import { SubscriptionService } from '@subscribe/service/subscription.service';

@Module({
  imports: [RssModule, FeedModule, JwtAuthModule],
  controllers: [SubscriptionController, UserSubscriptionController],
  providers: [SubscriptionService, SubscriptionRepository],
  exports: [],
})
export class SubscribeModule {}
