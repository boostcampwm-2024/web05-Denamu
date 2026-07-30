import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { QnaStatus } from '@qna/constant/qna.constant';
import { Qna } from '@qna/entity/qna.entity';

@Injectable()
export class QnaRepository extends Repository<Qna> {
  constructor(private dataSource: DataSource) {
    super(Qna, dataSource.createEntityManager());
  }

  async findPublicList(page: number, limit: number) {
    const query = this.createQueryBuilder('qna')
      .leftJoinAndSelect('qna.user', 'user')
      .orderBy('qna.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, totalCount] = await query.getManyAndCount();
    return { items, totalCount };
  }

  async findAdminList(page: number, limit: number, status?: QnaStatus) {
    const query = this.createQueryBuilder('qna').leftJoinAndSelect(
      'qna.user',
      'user',
    );

    if (status) {
      query.andWhere('qna.status = :status', { status });
    }

    const [items, totalCount] = await query
      .orderBy('qna.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, totalCount };
  }

  async findByIdWithMessages(id: number): Promise<Qna | null> {
    return this.createQueryBuilder('qna')
      .leftJoinAndSelect('qna.user', 'user')
      .leftJoinAndSelect('qna.messages', 'messages')
      .leftJoinAndSelect('messages.admin', 'admin')
      .where('qna.id = :id', { id })
      .orderBy('messages.id', 'ASC')
      .getOne();
  }
}
