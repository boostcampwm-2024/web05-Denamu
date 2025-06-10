import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Activity } from '../entity/activity.entity';
import { User } from '../../user/entity/user.entity';

@Injectable()
export class ActivityRepository extends Repository<Activity> {
  constructor(private dataSource: DataSource) {
    super(Activity, dataSource.createEntityManager());
  }

  async upsertByUserId(userId: number): Promise<void> {
    await this.query(
      `
      INSERT INTO activity (user_id, activity_date, view_count) 
      VALUES (?, CURDATE(), 1) 
      ON DUPLICATE KEY UPDATE view_count = view_count + 1
    `,
      [userId],
    );
  }
}
