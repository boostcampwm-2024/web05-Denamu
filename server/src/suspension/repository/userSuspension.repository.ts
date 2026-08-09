import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { UserSuspension } from '@suspension/entity/userSuspension.entity';

@Injectable()
export class UserSuspensionRepository extends Repository<UserSuspension> {
  constructor(private dataSource: DataSource) {
    super(UserSuspension, dataSource.createEntityManager());
  }
}
