import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';

import * as _ from 'lodash';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { FeedService } from '@feed/service/feed.service';

@Injectable()
export class FeedScheduler {
  constructor(
    private readonly redisService: RedisService,
    private readonly eventService: EventEmitter2,
    private readonly feedService: FeedService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetTrendTable() {
    await this.redisService.del(REDIS_KEYS.FEED_TREND_KEY);
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async analyzeTrend() {
    const [originTrend, nowTrend] = await Promise.all([
      this.redisService.lrange(REDIS_KEYS.FEED_ORIGIN_TREND_KEY, 0, 3),
      this.redisService.zrevrange(REDIS_KEYS.FEED_TREND_KEY, 0, 3),
    ]);

    if (nowTrend.length) {
      await this.redisService.executePipeline((pipeline) => {
        for (const feedId of nowTrend) {
          pipeline.expire(
            REDIS_KEYS.FEED_INFO_ITEM_KEY(feedId),
            REDIS_KEYS.FEED_INFO_TTL_SECONDS,
          );
        }
      });
    }

    if (!_.isEqual(originTrend, nowTrend)) {
      await this.redisService.executePipeline((pipeline) => {
        pipeline.del(REDIS_KEYS.FEED_ORIGIN_TREND_KEY);
        pipeline.rpush(REDIS_KEYS.FEED_ORIGIN_TREND_KEY, ...nowTrend);
      });
      const trendFeeds = await this.feedService.readTrendFeedList();
      await this.feedService.cacheTrendFeeds(trendFeeds);
      this.eventService.emit('ranking-update', trendFeeds);
    }
  }
}
