import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { User } from '@user/entity/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }
}
