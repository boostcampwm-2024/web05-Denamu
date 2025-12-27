import { REDIS_KEYS } from '../../../../../src/common/redis/redis.constant';
import { RedisService } from '../../../../../src/common/redis/redis.service';
import { FeedRepository } from '../../../../../src/feed/repository/feed.repository';
import { RssAcceptRepository } from '../../../../../src/rss/repository/rss.repository';
import { TagRepository } from '../../../../../src/tag/repository/tag.repository';
import { E2EHelper } from '../e2e-helper';

export class FeedE2EHelper extends E2EHelper {
  public readonly feedRepository: FeedRepository;
  public readonly rssAcceptRepository: RssAcceptRepository;
  public readonly tagRepository: TagRepository;
  public readonly redisService: RedisService;

  constructor() {
    super();
    this.feedRepository = this.app.get(FeedRepository);
    this.rssAcceptRepository = this.app.get(RssAcceptRepository);
    this.tagRepository = this.app.get(TagRepository);
    this.redisService = this.app.get(RedisService);
  }

  getRecentRedisKey(data: string) {
    return `${REDIS_KEYS.FEED_RECENT_KEY}:${data}`;
  }

  getReadRedisKey(data: string) {
    return `feed:${data}:ip`;
  }
}
