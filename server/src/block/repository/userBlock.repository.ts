import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { UserBlock } from '@block/entity/userBlock.entity';

@Injectable()
export class UserBlockRepository extends Repository<UserBlock> {
  constructor(private dataSource: DataSource) {
    super(UserBlock, dataSource.createEntityManager());
  }

  async getBlockedUsers(blockerId: number) {
    return this.find({
      where: { blocker: { id: blockerId } },
      relations: { blocked: true },
      select: {
        id: true,
        createdAt: true,
        blocked: { id: true, userName: true, profileImage: true },
      },
      order: { id: 'DESC' },
    });
  }
}
