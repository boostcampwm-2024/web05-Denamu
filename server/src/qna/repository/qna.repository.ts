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
    const [items, totalCount] = await this.findAndCount({
      relations: { user: true },
      order: { id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, totalCount };
  }

  async findAdminList(page: number, limit: number, status?: QnaStatus) {
    const [items, totalCount] = await this.findAndCount({
      where: status ? { status } : {},
      relations: { user: true },
      order: { id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, totalCount };
  }

  async findByIdWithMessages(id: number): Promise<Qna | null> {
    return this.findOne({
      where: { id },
      relations: { user: true, messages: { admin: true } },
      order: { messages: { id: 'ASC' } },
    });
  }
}
