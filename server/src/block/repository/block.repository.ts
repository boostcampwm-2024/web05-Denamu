import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { Block } from '@block/entity/block.entity';

@Injectable()
export class BlockRepository extends Repository<Block> {
  constructor(private dataSource: DataSource) {
    super(Block, dataSource.createEntityManager());
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
