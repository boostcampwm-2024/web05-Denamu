import { Module } from '@nestjs/common';

import { ActivityController } from '@activity/controller/activity.controller';
import { ActivityRepository } from '@activity/repository/activity.repository';
import { ActivityService } from '@activity/service/activity.service';

import { UserModule } from '@user/module/user.module';

@Module({
  imports: [UserModule],
  controllers: [ActivityController],
  providers: [ActivityRepository, ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
