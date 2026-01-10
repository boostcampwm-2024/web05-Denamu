import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { Like } from '@like/entity/like.entity';

@Injectable()
export class LikeRepository extends Repository<Like> {
  constructor(private dataSource: DataSource) {
    super(Like, dataSource.createEntityManager());
  }
}
