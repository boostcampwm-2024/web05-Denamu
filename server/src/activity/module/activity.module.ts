import { Module } from '@nestjs/common';
import { ActivityRepository } from '../repository/activity.repository';
import { ActivityController } from '../controller/activity.controller';
import { ActivityService } from '../service/activity.service';
import { UserRepository } from '../../user/repository/user.repository';

@Module({
  controllers: [ActivityController],
  imports: [],
  providers: [ActivityRepository, ActivityService, UserRepository],
  exports: [ActivityService],
})
export class ActivityModule {}
