import { Injectable } from '@nestjs/common';

import { BoardStatus } from '@board/constant/board.constant';
import { Board } from '@board/entity/board.entity';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class BoardRepository extends Repository<Board> {
  constructor(private dataSource: DataSource) {
    super(Board, dataSource.createEntityManager());
  }

  private applyVisibility(
    query: SelectQueryBuilder<Board>,
    now: Date,
  ): SelectQueryBuilder<Board> {
    return query
      .andWhere('board.status = :status', { status: BoardStatus.PUBLISHED })
      .andWhere('(board.startAt IS NULL OR board.startAt <= :now)', { now })
      .andWhere('(board.endAt IS NULL OR board.endAt >= :now)', { now });
  }

  async findPublicList(page: number, limit: number, now: Date) {
    const query = this.applyVisibility(this.createQueryBuilder('board'), now);

    const [items, totalCount] = await query
      .orderBy('board.isPinned', 'DESC')
      .addOrderBy('board.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, totalCount };
  }

  async findPublicById(id: number, now: Date): Promise<Board | null> {
    const query = this.applyVisibility(
      this.createQueryBuilder('board')
        .leftJoinAndSelect('board.author', 'author')
        .where('board.id = :id', { id }),
      now,
    );
    return query.getOne();
  }

  async findAdminList(page: number, limit: number, status?: BoardStatus) {
    const query = this.createQueryBuilder('board');
    if (status) {
      query.andWhere('board.status = :status', { status });
    }

    const [items, totalCount] = await query
      .orderBy('board.isPinned', 'DESC')
      .addOrderBy('board.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, totalCount };
  }
}
