import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Activity } from '../entity/activity.entity';

@Injectable()
export class ActivityRepository extends Repository<Activity> {
  constructor(private dataSource: DataSource) {
    super(Activity, dataSource.createEntityManager());
  }
}
