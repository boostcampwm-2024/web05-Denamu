import { Injectable } from '@nestjs/common';
import { ActivityRepository } from '@src/activity/repository/activity.repository';
import {
  ReadActivityResponseDto,
  DailyActivityDto,
} from '@src/activity/dto/response/readActivity.dto';
import { UserService } from '@src/user/service/user.service';

@Injectable()
export class ActivityService {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly userService: UserService,
  ) {}

  async readActivities(
    userId: number,
    year: number,
  ): Promise<ReadActivityResponseDto> {
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

    return ReadActivityResponseDto.toResponseDto(dailyActivities, user);
  }

  async upsertActivity(userId: number) {
    await this.activityRepository.upsertByUserId(userId);
  }
}
