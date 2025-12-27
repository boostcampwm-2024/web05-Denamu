import {
  RssAcceptRepository,
  RssRejectRepository,
  RssRepository,
} from './../../../../../src/rss/repository/rss.repository';
import { E2EHelper } from '../e2e-helper';
import { RedisService } from '../../../../../src/common/redis/redis.service';
import { REDIS_KEYS } from '../../../../../src/common/redis/redis.constant';

export class RssE2EHelper extends E2EHelper {
  public readonly rssRepository: RssRepository;
  public readonly rssAcceptRepository: RssAcceptRepository;
  public readonly rssRejectRepository: RssRejectRepository;
  public readonly redisService: RedisService;

  constructor() {
    super();
    this.rssAcceptRepository = this.app.get(RssAcceptRepository);
    this.rssRejectRepository = this.app.get(RssRejectRepository);
    this.redisService = this.app.get(RedisService);
  }

  getAdminRedisKey(data: string) {
    return `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;
  }

  getRssRemoveRedisKey(data: string) {
    return `${REDIS_KEYS.RSS_REMOVE_KEY}:${data}`;
  }
}
