import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { User } from '@user/entity/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async searchUserList(find: string, limit: number, offset: number) {
    const escaped = find.replace(/[\\%_]/g, (char) => `\\${char}`);

    return this.createQueryBuilder('user')
      .where('user.userName LIKE :pattern', { pattern: `%${escaped}%` })
      .orderBy('user.userName = :find', 'DESC')
      .addOrderBy('user.userName LIKE :prefix', 'DESC')
      .addOrderBy('user.userName', 'ASC')
      .setParameters({ find, prefix: `${escaped}%` })
      .skip(offset)
      .take(limit)
      .getManyAndCount();
  }
}
