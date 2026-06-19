import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { Activity } from '@activity/entity/activity.entity';

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

  async findActivityYearsByUserId(userId: number): Promise<number[]> {
    const rows = await this.createQueryBuilder('activity')
      .select('DISTINCT YEAR(activity.activity_date)', 'year')
      .where('activity.user_id = :userId', { userId })
      .orderBy('year', 'DESC')
      .getRawMany<{ year: number }>();

    return rows.map((row) => Number(row.year));
  }

  async findActivitiesByUserIdAndYear(
    userId: number,
    year: number,
  ): Promise<Activity[]> {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    return this.createQueryBuilder('activity')
      .leftJoinAndSelect('activity.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('activity.activityDate >= :startDate', { startDate })
      .andWhere('activity.activityDate <= :endDate', { endDate })
      .orderBy('activity.activityDate', 'ASC')
      .getMany();
  }
}
