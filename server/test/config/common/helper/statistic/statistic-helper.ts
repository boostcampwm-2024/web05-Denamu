import { RedisService } from '../../../../../src/common/redis/redis.service';
import { FeedRepository } from '../../../../../src/feed/repository/feed.repository';
import { RssAcceptRepository } from '../../../../../src/rss/repository/rss.repository';
import { E2EHelper } from '../e2e-helper';

export class StatisticE2EHelper extends E2EHelper {
  public readonly rssAcceptRepository: RssAcceptRepository;
  public readonly feedRepository: FeedRepository;
  public readonly redisService: RedisService;

  constructor() {
    super();
    this.rssAcceptRepository = this.app.get(RssAcceptRepository);
    this.feedRepository = this.app.get(FeedRepository);
  }
}
