import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { FeedScheduler } from '@feed/scheduler/feed.scheduler';

describe(`${FeedScheduler.name} Unit Test`, () => {
  let feedScheduler: FeedScheduler;
  let redisService: jest.Mocked<Pick<RedisService, 'del' | 'keys'>>;

  beforeEach(() => {
    jest.clearAllMocks();
    redisService = {
      del: jest.fn(),
      keys: jest.fn(),
    };

    feedScheduler = new FeedScheduler(
      redisService as unknown as RedisService,
      {} as any,
      {} as any,
    );
  });

  describe('resetTrendTable', () => {
    it('feed:trend 키를 삭제한다.', async () => {
      // when
      await feedScheduler.resetTrendTable();

      // then
      expect(redisService.del).toHaveBeenCalledWith(REDIS_KEYS.FEED_TREND_KEY);
    });
  });
});
