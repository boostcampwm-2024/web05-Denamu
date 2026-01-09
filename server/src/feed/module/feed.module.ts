import { forwardRef, Module } from '@nestjs/common';
import { FeedController } from '@src/feed/controller/feed.controller';
import { FeedService } from '@src/feed/service/feed.service';
import {
  FeedRepository,
  FeedViewRepository,
} from '@src/feed/repository/feed.repository';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { FeedScheduler } from '@src/feed/scheduler/feed.scheduler';
import { UserModule } from '@src/user/module/user.module';
import { ActivityModule } from '@src/activity/module/activity.module';
import { ReadFeedInterceptor } from '@src/feed/interceptor/read-feed.interceptor';
import { JwtAuthModule } from '@src/common/auth/jwt.module';
import { LikeModule } from '@src/like/module/like.module';
import { CommentModule } from '@src/comment/module/comment.module';
import { RssModule } from '@src/rss/module/rss.module';

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
