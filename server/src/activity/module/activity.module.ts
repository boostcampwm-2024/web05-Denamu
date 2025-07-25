import { Module } from '@nestjs/common';
import { ActivityRepository } from '../repository/activity.repository';
import { ActivityController } from '../controller/activity.controller';
import { ActivityService } from '../service/activity.service';
import { UserModule } from '../../user/module/user.module';

@Module({
  imports: [UserModule],
  controllers: [ActivityController],
  providers: [ActivityRepository, ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
