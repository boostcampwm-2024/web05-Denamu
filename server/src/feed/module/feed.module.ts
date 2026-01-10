import { ActivityModule } from '@activity/module/activity.module';

import { CommentModule } from '@comment/module/comment.module';

import { JwtAuthModule } from '@common/auth/jwt.module';

import { FeedController } from '@feed/controller/feed.controller';
import { ReadFeedInterceptor } from '@feed/interceptor/read-feed.interceptor';
import {
  FeedRepository,
  FeedViewRepository,
} from '@feed/repository/feed.repository';
import { FeedScheduler } from '@feed/scheduler/feed.scheduler';
import { FeedService } from '@feed/service/feed.service';

import { LikeModule } from '@like/module/like.module';

import { RssModule } from '@rss/module/rss.module';

import { UserModule } from '@user/module/user.module';

import { Module, forwardRef } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    UserModule,
    ActivityModule,
    JwtAuthModule,
    forwardRef(() => RssModule),
    forwardRef(() => CommentModule),
    forwardRef(() => LikeModule),
  ],
  controllers: [FeedController],
  providers: [
    FeedService,
    FeedRepository,
    FeedViewRepository,
    FeedScheduler,
    ReadFeedInterceptor,
  ],
  exports: [FeedRepository, FeedService],
})
export class FeedModule {}
