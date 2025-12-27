import { FeedRepository } from './../../../../../src/feed/repository/feed.repository';
import { RssAcceptRepository } from './../../../../../src/rss/repository/rss.repository';
import { LikeRepository } from '../../../../../src/like/repository/like.repository';
import { UserRepository } from '../../../../../src/user/repository/user.repository';
import { E2EHelper } from '../e2e-helper';

export class LikeE2EHelper extends E2EHelper {
  public readonly likeRepository: LikeRepository;
  public readonly userRepository: UserRepository;
  public readonly rssAcceptRepository: RssAcceptRepository;
  public readonly feedRepository: FeedRepository;

  constructor() {
    super();
    this.likeRepository = this.app.get(LikeRepository);
    this.userRepository = this.app.get(UserRepository);
    this.rssAcceptRepository = this.app.get(RssAcceptRepository);
    this.feedRepository = this.app.get(FeedRepository);
  }
}
