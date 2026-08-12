import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { UserBlock } from '@block/entity/userBlock.entity';

import { RssAccept } from '@rss/entity/rss.entity';

import { activeSuspensionExclusion } from '@suspension/constant/activeSuspension.constant';

import { User } from '@user/entity/user.entity';

export interface UserSearchRow {
  id: number;
  userName: string;
  profileImage: string | null;
  introduction: string | null;
  blogCount: number;
}

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
      .select('user.id', 'id')
      .addSelect('user.userName', 'userName')
      .addSelect('user.profileImage', 'profileImage')
      .addSelect('user.introduction', 'introduction')
      .addSelect(
        (qb) =>
          qb
            .subQuery()
            .select('COUNT(*)')
            .from(RssAccept, 'rss_accept')
            .where('rss_accept.user_id = user.id'),
        'blogCount',
      )
      .where('user.userName LIKE :pattern', { pattern: `%${escaped}%` })
      .andWhere(activeSuspensionExclusion('user.id'))
      .orderBy('user.userName = :find', 'DESC')
      .addOrderBy('user.userName LIKE :prefix', 'DESC')
      .addOrderBy('user.userName', 'ASC')
      .setParameters({ find, prefix: `${escaped}%`, now: new Date() })
      .skip(offset)
      .take(limit);

    if (blockerId) {
      query.andWhere(
        'user.id NOT IN (SELECT block.blocked_id FROM blocks block WHERE block.blocker_id = :blockerId)',
        { blockerId },
      );
    }

    const [rows, totalCount] = await Promise.all([
      query.getRawMany<
        Omit<UserSearchRow, 'id' | 'blogCount'> & {
          id: number | string;
          blogCount: string;
        }
      >(),
      query.getCount(),
    ]);

    const users: UserSearchRow[] = rows.map((row) => ({
      ...row,
      id: Number(row.id),
      blogCount: Number(row.blogCount ?? 0),
    }));

    return [users, totalCount] as const;
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
