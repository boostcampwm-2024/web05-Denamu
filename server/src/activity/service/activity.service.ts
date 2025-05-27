import { Injectable } from '@nestjs/common';
import { ActivityRepository } from '../repository/activity.repository';
import { User } from '../../user/entity/user.entity';

@Injectable()
export class ActivityService {
  constructor(private readonly activityRepository: ActivityRepository) {}

  async readActivities(userId: number, year: number) {
    // TODO: 연도별 활동 데이터 전체 조회
    // 1. 연도별 활동 데이터 전체 반환 (일, 활동수 쌍)

    // + metric 수집 및 반환 (User Entity에 존재함.)
    // 1. 최장 읽기 스트릭
    // 2. 현재 읽기 스트릭
    // 3. 총 읽은 횟수
    return 'foo';
  }

  async upsertActivity(userId: number) {
    await this.activityRepository.upsertByUserId(userId);
  }
}
