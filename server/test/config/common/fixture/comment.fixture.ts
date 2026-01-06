import { Comment } from '../../../../src/comment/entity/comment.entity';
import { Feed } from '../../../../src/feed/entity/feed.entity';
import { User } from '../../../../src/user/entity/user.entity';

export const COMMENT_DEFAULT_TEXT = 'test comment';

export class CommentFixture {
  static createGeneralComment() {
    return {
      comment: COMMENT_DEFAULT_TEXT,
      date: new Date('2025-11-22'),
    };
  }

  static createCommentFixture(
    feed: Feed,
    user: User,
    overwrites: Partial<Comment> = {},
  ): Comment {
    const comment = new Comment();
    return Object.assign(
      comment,
      this.createGeneralComment(),
      { feed, user },
      overwrites,
    );
  }
}
