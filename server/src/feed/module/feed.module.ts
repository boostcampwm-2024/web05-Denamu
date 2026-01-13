import { forwardRef, Module } from '@nestjs/common';
import { FeedController } from '@feed/controller/feed.controller';
import { FeedService } from '@feed/service/feed.service';
import {
  FeedRepository,
  FeedViewRepository,
} from '@feed/repository/feed.repository';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { FeedScheduler } from '@feed/scheduler/feed.scheduler';
import { UserModule } from '@user/module/user.module';
import { ActivityModule } from '@activity/module/activity.module';
import { ReadFeedInterceptor } from '@feed/interceptor/read-feed.interceptor';
import { JwtAuthModule } from '@common/auth/jwt.module';
import { LikeModule } from '@like/module/like.module';
import { CommentModule } from '@comment/module/comment.module';
import { RssModule } from '@rss/module/rss.module';

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
