import { ActivityController } from '@activity/controller/activity.controller';
import { ActivityRepository } from '@activity/repository/activity.repository';
import { ActivityService } from '@activity/service/activity.service';

import { UserModule } from '@user/module/user.module';

import { Module } from '@nestjs/common';

@Module({
  imports: [UserModule],
  controllers: [ActivityController],
  providers: [ActivityRepository, ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
