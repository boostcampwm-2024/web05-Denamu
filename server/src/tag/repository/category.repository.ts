import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { Category } from '@tag/entity/category.entity';

@Injectable()
export class CategoryRepository extends Repository<Category> {
  constructor(private dataSource: DataSource) {
    super(Category, dataSource.createEntityManager());
  }

  async findAllWithTags(): Promise<Category[]> {
    return this.find({
      relations: ['tags'],
      order: { displayOrder: 'ASC', tags: { id: 'ASC' } },
    });
  }
}
