import { Like } from '@like/entity/like.entity';

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class LikeRepository extends Repository<Like> {
  constructor(private dataSource: DataSource) {
    super(Like, dataSource.createEntityManager());
  }
}
