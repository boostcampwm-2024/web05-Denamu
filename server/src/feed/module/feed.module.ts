import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    UserModule,
    ActivityModule,
    JwtAuthModule,
  ],
  controllers: [FeedController],
  providers: [
    FeedService,
    FeedRepository,
    FeedViewRepository,
    FeedScheduler,
    ReadFeedInterceptor,
  ],
  exports: [FeedRepository],
})
export class FeedModule {}
