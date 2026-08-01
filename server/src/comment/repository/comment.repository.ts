import { Injectable } from '@nestjs/common';

import { DataSource, LessThan, Repository } from 'typeorm';

import { Comment } from '@comment/entity/comment.entity';

@Injectable()
export class CommentRepository extends Repository<Comment> {
  constructor(private dataSource: DataSource) {
    super(Comment, dataSource.createEntityManager());
  }

  async getCommentInformation(feedId: number, blockerId?: number) {
    const query = this.createQueryBuilder('comment')
      .innerJoin('comment.user', 'user')
      .select(['comment', 'comment.date', 'user'])
      .where('comment.feed_id = :feedId', { feedId })
      .orderBy('comment.date', 'ASC');

    if (blockerId) {
      query
        .leftJoin('comment.parent', 'parent')
        .andWhere(
          'comment.user_id NOT IN (SELECT block.blocked_id FROM blocks block WHERE block.blocker_id = :blockerId)',
          { blockerId },
        )
        .andWhere(
          '(comment.parent_id IS NULL OR parent.user_id NOT IN (SELECT block.blocked_id FROM blocks block WHERE block.blocker_id = :blockerId))',
        );
    }

    return await query.getMany();
  }

  async getCommentsByUser(userId: number, lastId: number, limit: number) {
    return this.find({
      where: {
        user: { id: userId },
        feed: { isPublic: true },
        ...(lastId && { id: LessThan(lastId) }),
      },
      relations: { feed: true },
      select: { id: true, comment: true, date: true, feed: { id: true, title: true, path: true } },
      order: { id: 'DESC' },
      take: limit + 1,
    });
  }
}
