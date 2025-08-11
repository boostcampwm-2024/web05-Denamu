import { Injectable } from '@nestjs/common';
import { ActivityRepository } from '../repository/activity.repository';
import {
  ActivityReadResponseDto,
  DailyActivityDto,
} from '../dto/response/activity-read.dto';
import { UserService } from '../../user/service/user.service';

@Injectable()
export class ActivityService {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly userService: UserService,
  ) {}

  async readActivities(
    userId: number,
    year: number,
  ): Promise<ActivityReadResponseDto> {
    const user = await this.userService.getUser(userId);

    const activities =
      await this.activityRepository.findActivitiesByUserIdAndYear(userId, year);

    const dailyActivities = activities.map(
      (activity) =>
        new DailyActivityDto({
          date: activity.activityDate.toISOString().split('T')[0],
          viewCount: activity.viewCount,
        }),
    );

    return ActivityReadResponseDto.toResponseDto(dailyActivities, user);
  }

  async upsertActivity(userId: number) {
    await this.activityRepository.upsertByUserId(userId);
  }
}
