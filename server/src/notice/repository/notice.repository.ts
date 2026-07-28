import { Injectable } from '@nestjs/common';

import { NoticeStatus } from '@notice/constant/notice.constant';
import { Notice } from '@notice/entity/notice.entity';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class NoticeRepository extends Repository<Notice> {
  constructor(private dataSource: DataSource) {
    super(Notice, dataSource.createEntityManager());
  }

  private applyVisibility(
    query: SelectQueryBuilder<Notice>,
    now: Date,
  ): SelectQueryBuilder<Notice> {
    return query
      .andWhere('notice.status = :status', { status: NoticeStatus.PUBLISHED })
      .andWhere('(notice.startAt IS NULL OR notice.startAt <= :now)', { now })
      .andWhere('(notice.endAt IS NULL OR notice.endAt >= :now)', { now });
  }

  async findPublicList(page: number, limit: number, now: Date) {
    const query = this.applyVisibility(this.createQueryBuilder('notice'), now);

    const [items, totalCount] = await query
      .orderBy('notice.isPinned', 'DESC')
      .addOrderBy('notice.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, totalCount };
  }

  async findPublicById(id: number, now: Date): Promise<Notice | null> {
    const query = this.applyVisibility(
      this.createQueryBuilder('notice')
        .leftJoinAndSelect('notice.author', 'author')
        .where('notice.id = :id', { id }),
      now,
    );
    return query.getOne();
  }

  async findAdminList(page: number, limit: number, status?: NoticeStatus) {
    const query = this.createQueryBuilder('notice');
    if (status) {
      query.andWhere('notice.status = :status', { status });
    }

    const [items, totalCount] = await query
      .orderBy('notice.isPinned', 'DESC')
      .addOrderBy('notice.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, totalCount };
  }
}
