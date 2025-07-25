import { forwardRef, Module } from '@nestjs/common';
import { FeedController } from '../controller/feed.controller';
import { FeedService } from '../service/feed.service';
import {
  FeedRepository,
  FeedViewRepository,
} from '../repository/feed.repository';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { FeedScheduler } from '../scheduler/feed.scheduler';
import { UserModule } from '../../user/module/user.module';
import { ActivityModule } from '../../activity/module/activity.module';
import { ReadFeedInterceptor } from '../interceptor/read-feed.interceptor';
import { JwtAuthModule } from '../../common/auth/jwt.module';
import { LikeModule } from '../../like/module/like.module';
import { CommentModule } from '../../comment/module/comment.module';
import { FeedCrawlerService } from '../service/feed-crawler.service';
import { RssModule } from '../../rss/module/rss.module';

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
    FeedCrawlerService,
  ],
  exports: [FeedRepository, FeedCrawlerService],
})
export class FeedModule {}
