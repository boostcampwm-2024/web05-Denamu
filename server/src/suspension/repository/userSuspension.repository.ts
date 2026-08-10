import { Injectable } from '@nestjs/common';

import { DataSource, IsNull, MoreThan, Repository } from 'typeorm';

import { UserSuspension } from '@suspension/entity/userSuspension.entity';

@Injectable()
export class UserSuspensionRepository extends Repository<UserSuspension> {
  constructor(private dataSource: DataSource) {
    super(UserSuspension, dataSource.createEntityManager());
  }

  async findActiveSuspendedUsers(lastId: number | undefined, limit: number) {
    const now = new Date();

    const query = this.createQueryBuilder('suspension')
      .innerJoin('suspension.user', 'user')
      .leftJoin('suspension.admin', 'admin')
      .select(['suspension', 'user.id', 'user.userName', 'user.email'])
      .addSelect(['admin.id', 'admin.name'])
      .where(
        `suspension.id = (
          SELECT MAX(latest.id) FROM user_suspension latest
          WHERE latest.user_id = suspension.user_id
            AND (latest.suspended_until IS NULL OR latest.suspended_until > :now)
        )`,
        { now },
      );

    if (lastId) {
      query.andWhere('suspension.id < :lastId', { lastId });
    }

    return query
      .orderBy('suspension.id', 'DESC')
      .take(limit + 1)
      .getMany();
  }

  async findActiveSuspension(userId: number): Promise<UserSuspension | null> {
    const now = new Date();

    return this.findOne({
      where: [
        { user: { id: userId }, suspendedUntil: IsNull() },
        { user: { id: userId }, suspendedUntil: MoreThan(now) },
      ],
      order: { id: 'DESC' },
    });
  }
}
