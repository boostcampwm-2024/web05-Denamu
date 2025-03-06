import { Module } from '@nestjs/common';
import { ActivityRepository } from '../repository/activity.repository';

@Module({
  controllers: [],
  imports: [],
  providers: [ActivityRepository],
})
export class ActivityModule {}
