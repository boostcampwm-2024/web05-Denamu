import { Injectable, NotFoundException } from '@nestjs/common';
import { ActivityRepository } from '../repository/activity.repository';
import { UserRepository } from '../../user/repository/user.repository';
import {
  ActivityReadResponseDto,
  DailyActivityDto,
} from '../dto/response/activity-read.dto';

@Injectable()
export class ActivityService {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async readActivities(
    userId: number,
    year: number,
  ): Promise<ActivityReadResponseDto> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }

    const activities =
      await this.activityRepository.findActivitiesByUserIdAndYear(userId, year);

    const dailyActivities = activities.map(
      (activity) =>
        new DailyActivityDto({
          date: activity.activityDate.toISOString().split('T')[0],
          viewCount: activity.viewCount,
        }),
    );

    return new ActivityReadResponseDto({
      dailyActivities,
      maxStreak: user.maxStreak,
      currentStreak: user.currentStreak,
      totalViews: user.totalViews,
    });
  }

  async upsertActivity(userId: number) {
    await this.activityRepository.upsertByUserId(userId);
  }
}
