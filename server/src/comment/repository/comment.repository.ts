import { DataSource, Repository } from 'typeorm';
import { Comment } from '../entity/comment.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentRepository extends Repository<Comment> {
  constructor(private dataSource: DataSource) {
    super(Comment, dataSource.createEntityManager());
  }

  async getCommentInformation(feedId: number) {
    const results = await this.createQueryBuilder('comment')
      .innerJoin('comment.user', 'user') // ✅ 관계명은 'user'로
      .where('comment.feed_id = :feedId', { feedId })
      .select(['comment', 'comment.date', 'user'])
      .orderBy('comment.date', 'ASC')
      .getMany();
    return results.map((row) => ({
      id: row.id,
      comment: row.comment,
      date: row.date,
      user: {
        id: row.user.id,
        userName: row.user.userName,
        profileImage: row.user.profileImage,
      },
    }));
  }
}
