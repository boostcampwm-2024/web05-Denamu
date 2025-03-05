import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { TagMap } from '../entity/tag-map.entity';

@Injectable()
export class TagMapRepository extends Repository<TagMap> {
  constructor(private dataSource: DataSource) {
    super(TagMap, dataSource.createEntityManager());
  }
}
