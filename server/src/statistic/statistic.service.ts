import { Injectable } from '@nestjs/common';
import { RedisService } from '../common/redis/redis.service';
import { FeedRepository } from '../feed/feed.repository';
import { redisKeys } from '../common/redis/redis.constant';

@Injectable()
export class StatisticService {
  constructor(
    private readonly redisService: RedisService,
    private readonly feedRepository: FeedRepository,
  ) {}
  async getTodayViewCount(limit: number) {
    const ranking = await this.redisService.redisClient.zrevrange(
      redisKeys.FEED_TREND_KEY,
      0,
      limit - 1,
      'WITHSCORES',
    );
    const result = [];

    for (let i = 0; i < ranking.length; i += 2) {
      const feedId = parseInt(ranking[i]);
      const score = parseFloat(ranking[i + 1]);

      const feedData = await this.feedRepository.findTrendFeed(feedId);

      result.push({
        id: feedData.id,
        title: feedData.title,
        viewCount: score,
      });
    }

    return result;
  }
}