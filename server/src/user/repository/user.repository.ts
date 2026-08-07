import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { UserBlock } from '@block/entity/userBlock.entity';

import { User } from '@user/entity/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async searchUserList(
    find: string,
    limit: number,
    offset: number,
    blockerId?: number,
  ) {
    const escaped = find.replace(/[\\%_]/g, (char) => `\\${char}`);

    const query = this.createQueryBuilder('user')
      .where('user.userName LIKE :pattern', { pattern: `%${escaped}%` })
      .orderBy('user.userName = :find', 'DESC')
      .addOrderBy('user.userName LIKE :prefix', 'DESC')
      .addOrderBy('user.userName', 'ASC')
      .setParameters({ find, prefix: `${escaped}%` })
      .skip(offset)
      .take(limit);

    if (blockerId) {
      query.andWhere(
        'user.id NOT IN (SELECT block.blocked_id FROM blocks block WHERE block.blocker_id = :blockerId)',
        { blockerId },
      );
    }

    return query.getManyAndCount();
  }

  async isUserBlocked(blockerId: number, blockedId: number) {
    return await this.manager.exists(UserBlock, {
      where: {
        blocker: { id: blockerId },
        blocked: { id: blockedId },
      },
    });
  }

  async findNoticeAgreedUsers(): Promise<Pick<User, 'email' | 'userName'>[]> {
    return this.find({
      where: { noticeEmailAgreed: true },
      select: ['email', 'userName'],
    });
  }

  async findMarketingAgreedUsers() {
    return this.find({
      where: { marketingEmailAgreed: true },
      select: ['email', 'userName'],
    });
  }
}
