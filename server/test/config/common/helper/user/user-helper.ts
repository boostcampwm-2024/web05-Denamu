import { CommentRepository } from './../../../../../src/comment/repository/comment.repository';
import { RedisService } from '../../../../../src/common/redis/redis.service';
import { UserRepository } from '../../../../../src/user/repository/user.repository';
import { E2EHelper } from '../e2e-helper';
import { LikeRepository } from '../../../../../src/like/repository/like.repository';
import { ActivityRepository } from '../../../../../src/activity/repository/activity.repository';
import { FileRepository } from '../../../../../src/file/repository/file.repository';
import { RssAcceptRepository } from '../../../../../src/rss/repository/rss.repository';
import { FeedRepository } from '../../../../../src/feed/repository/feed.repository';
import { REDIS_KEYS } from '../../../../../src/common/redis/redis.constant';

export class UserE2EHelper extends E2EHelper {
  public readonly redisService: RedisService;
  public readonly userRepository: UserRepository;
  public readonly commentRepository: CommentRepository;
  public readonly likeRepository: LikeRepository;
  public readonly activityRepository: ActivityRepository;
  public readonly fileRepository: FileRepository;
  public readonly rssAcceptRepository: RssAcceptRepository;
  public readonly feedRepository: FeedRepository;

  constructor() {
    super();
  }

  getDeleteRedisKey(data: string) {
    return `${REDIS_KEYS.USER_DELETE_ACCOUNT_KEY}:${data}`;
  }
}
