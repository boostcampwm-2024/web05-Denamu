import { Comment } from '../../../src/comment/entity/comment.entity';
import { Feed } from '../../../src/feed/entity/feed.entity';
import { User } from '../../../src/user/entity/user.entity';

export class CommentFixture {
  static readonly GENERAL_COMMENT = {
    comment: 'test',
    date: new Date('2025-11-22'),
  };

  static createCommentFixture(
    feed: Feed,
    user: User,
    overwrites: Partial<Comment> = {},
  ): Comment {
    const comment = new Comment();
    Object.assign(comment, {
      ...this.GENERAL_COMMENT,
      feed,
      user,
    });
    return Object.assign(comment, overwrites);
  }
}
