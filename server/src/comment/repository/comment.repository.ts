import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { Comment } from '@comment/entity/comment.entity';

@Injectable()
export class CommentRepository extends Repository<Comment> {
  constructor(private dataSource: DataSource) {
    super(Comment, dataSource.createEntityManager());
  }

  async getCommentInformation(feedId: number) {
    return await this.createQueryBuilder('comment')
      .innerJoin('comment.user', 'user')
      .select(['comment', 'comment.date', 'user'])
      .where('comment.feed_id = :feedId', { feedId })
      .orderBy('comment.date', 'ASC')
      .getMany();
  }

  async getCommentsByUser(userId: number, lastId: number, limit: number) {
    const query = this.createQueryBuilder('comment')
      .innerJoin('comment.feed', 'feed')
      .select(['comment.id', 'comment.comment', 'comment.date'])
      .addSelect(['feed.id', 'feed.title', 'feed.path'])
      .where('comment.user_id = :userId', { userId })
      .andWhere('feed.is_public = 1');

    if (lastId) {
      query.andWhere('comment.id < :lastId', { lastId });
    }

    return await query
      .orderBy('comment.id', 'DESC')
      .take(limit + 1)
      .getMany();
  }
}
