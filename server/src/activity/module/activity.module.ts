import { Module } from '@nestjs/common';
import { ActivityRepository } from '../repository/activity.repository';
import { ActivityController } from '../controller/activity.controller';
import { ActivityService } from '../service/activity.service';

@Module({
  controllers: [ActivityController],
  imports: [],
  providers: [ActivityRepository, ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
