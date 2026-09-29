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

    return this.createQueryBuilder('suspension')
      .innerJoin(
        (qb) => {
          qb.select('MAX(latest.id)', 'id')
            .from(UserSuspension, 'latest')
            .where(
              '(latest.suspended_until IS NULL OR latest.suspended_until > :now)',
              { now },
            )
            .groupBy('latest.user_id');
          if (lastId) {
            qb.having('MAX(latest.id) < :lastId', { lastId });
          }
          return qb;
        },
        'active',
        'active.id = suspension.id',
      )
      .innerJoin('suspension.user', 'user')
      .leftJoin('suspension.admin', 'admin')
      .select(['suspension', 'user.id', 'user.userName', 'user.email'])
      .addSelect(['admin.id', 'admin.name'])
      .orderBy('suspension.id', 'DESC')
      .limit(limit + 1)
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

  async updateActiveSuspension(
    userId: number,
    data: {
      suspendedUntil: Date | null;
      detail: string;
      adminId: number | null;
    },
  ) {
    const now = new Date();

    const result = await this.update(
      [
        { user: { id: userId }, suspendedUntil: IsNull() },
        { user: { id: userId }, suspendedUntil: MoreThan(now) },
      ],
      {
        suspendedUntil: data.suspendedUntil,
        detail: data.detail,
        admin: data.adminId ? { id: data.adminId } : null,
      },
    );

    return result.affected ?? 0;
  }

  async deleteActiveSuspensions(userId: number) {
    const now = new Date();

    const result = await this.delete([
      { user: { id: userId }, suspendedUntil: IsNull() },
      { user: { id: userId }, suspendedUntil: MoreThan(now) },
    ]);

    return result.affected ?? 0;
  }
}
