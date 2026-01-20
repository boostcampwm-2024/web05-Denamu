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

    if (!_.isEqual(originTrend, nowTrend)) {
      await this.redisService.executePipeline((pipeline) => {
        pipeline.del(REDIS_KEYS.FEED_ORIGIN_TREND_KEY);
        pipeline.rpush(REDIS_KEYS.FEED_ORIGIN_TREND_KEY, ...nowTrend);
      });
      const trendFeeds = await this.feedService.readTrendFeedList();
      this.eventService.emit('ranking-update', trendFeeds);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetIpTable() {
    const keys = await this.redisService.keys(REDIS_KEYS.FEED_ALL_IP_KEY);

    if (keys.length > 0) {
      await this.redisService.del(...keys);
    }
  }
}
