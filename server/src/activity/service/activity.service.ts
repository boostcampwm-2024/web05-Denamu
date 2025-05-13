import { Injectable } from '@nestjs/common';
import { ActivityRepository } from '../repository/activity.repository';

@Injectable()
export class ActivityService {
  constructor(private readonly activityRepository: ActivityRepository) {}

  async readActivities(userId: number, year: number) {
    // TODO: 연도별 활동 데이터 전체 조회
    // + metric 수집

    return 'foo';
  }
}
