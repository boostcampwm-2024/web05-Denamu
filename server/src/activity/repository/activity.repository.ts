import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Activity } from '../entity/activity.entity';
import { User } from '../../user/entity/user.entity';

@Injectable()
export class ActivityRepository extends Repository<Activity> {
  constructor(private dataSource: DataSource) {
    super(Activity, dataSource.createEntityManager());
  }

  async upsertByUser(user: User): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into(Activity)
      .values({
        user: { id: user.id },
        activityDate: () => 'CURDATE()',
        viewCount: 1,
      })
      .orUpdate(['view_count = view_count + 1'], ['user_id', 'activity_date'])
      .execute();
  }
}
