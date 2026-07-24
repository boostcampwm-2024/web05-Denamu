import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { UserBlock } from '@block/entity/userBlock.entity';

@Injectable()
export class UserBlockRepository extends Repository<UserBlock> {
  constructor(private dataSource: DataSource) {
    super(UserBlock, dataSource.createEntityManager());
  }

  async getBlockedUsers(blockerId: number) {
    return await this.createQueryBuilder('block')
      .innerJoin('block.blocked', 'blocked')
      .select(['block.id', 'block.createdAt'])
      .addSelect(['blocked.id', 'blocked.userName', 'blocked.profileImage'])
      .where('block.blocker_id = :blockerId', { blockerId })
      .orderBy('block.id', 'DESC')
      .getMany();
  }
}
