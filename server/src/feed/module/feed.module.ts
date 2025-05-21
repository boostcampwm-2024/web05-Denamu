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

@Module({
  imports: [ScheduleModule.forRoot(), EventEmitterModule.forRoot(), UserModule],
  controllers: [FeedController],
  providers: [FeedService, FeedRepository, FeedViewRepository, FeedScheduler],
  exports: [FeedRepository],
})
export class FeedModule {}
