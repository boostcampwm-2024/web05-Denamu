import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { MarketingEmail } from '@marketingEmail/entity/marketingEmail.entity';

@Injectable()
export class MarketingEmailRepository extends Repository<MarketingEmail> {
  constructor(private dataSource: DataSource) {
    super(MarketingEmail, dataSource.createEntityManager());
  }

  async findAdminList(page: number, limit: number) {
    const [items, totalCount] = await this.findAndCount({
      relations: ['author'],
      order: { id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, totalCount };
  }
}
