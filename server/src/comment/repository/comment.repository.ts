import { DataSource, Repository } from 'typeorm';
import { Comment } from '../entity/comment.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentRepository extends Repository<Comment> {
  constructor(private dataSource: DataSource) {
    super(Comment, dataSource.createEntityManager());
  }

  async getCommentInformation(feedId: number) {
    return await this.createQueryBuilder('comment')
      .innerJoin('comment.user', 'user')
      .where('comment.feed_id = :feedId', { feedId })
      .select(['comment', 'comment.date', 'user'])
      .orderBy('comment.date', 'ASC')
      .getMany();
  }
}
