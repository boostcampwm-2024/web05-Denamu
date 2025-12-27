import { CommentRepository } from '../../../../../src/comment/repository/comment.repository';
import { FeedRepository } from '../../../../../src/feed/repository/feed.repository';
import { RssAcceptRepository } from '../../../../../src/rss/repository/rss.repository';
import { UserRepository } from '../../../../../src/user/repository/user.repository';
import { E2EHelper } from '../e2e-helper';

export class CommentE2EHelper extends E2EHelper {
  public readonly commentRepository: CommentRepository;
  public readonly userRepository: UserRepository;
  public readonly feedRepository: FeedRepository;
  public readonly rssAcceptRepository: RssAcceptRepository;

  constructor() {
    super();
    this.commentRepository = this.app.get(CommentRepository);
    this.userRepository = this.app.get(UserRepository);
    this.feedRepository = this.app.get(FeedRepository);
    this.rssAcceptRepository = this.app.get(RssAcceptRepository);
  }
}
