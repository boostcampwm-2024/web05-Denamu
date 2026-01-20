import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { Tag } from '@tag/entity/tag.entity';

@Injectable()
export class TagRepository extends Repository<Tag> {
  constructor(private dataSource: DataSource) {
    super(Tag, dataSource.createEntityManager());
  }
}
