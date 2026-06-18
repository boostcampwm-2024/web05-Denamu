import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { Like } from '@like/entity/like.entity';

@Injectable()
export class LikeRepository extends Repository<Like> {
  constructor(private dataSource: DataSource) {
    super(Like, dataSource.createEntityManager());
  }

  async getLikesByUser(userId: number, lastId: number, limit: number) {
    const query = this.createQueryBuilder('like')
      .innerJoin('like.feed', 'feed')
      .select(['like.id', 'like.likeDate'])
      .addSelect(['feed.id', 'feed.title', 'feed.path'])
      .where('like.user_id = :userId', { userId });

    if (lastId) {
      query.andWhere('like.id < :lastId', { lastId });
    }

    return await query
      .orderBy('like.id', 'DESC')
      .take(limit + 1)
      .getMany();
  }
}
