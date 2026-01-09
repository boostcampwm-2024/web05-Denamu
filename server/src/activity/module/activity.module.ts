import { Module } from '@nestjs/common';
import { ActivityRepository } from '@src/activity/repository/activity.repository';
import { ActivityController } from '@src/activity/controller/activity.controller';
import { ActivityService } from '@src/activity/service/activity.service';
import { UserModule } from '@src/user/module/user.module';

@Module({
  imports: [UserModule],
  controllers: [ActivityController],
  providers: [ActivityRepository, ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
