import { Injectable } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FeedService } from '../service/feed.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { redisKeys } from '../../common/redis/redis.constant';
import * as _ from 'lodash';

@Injectable()
export class FeedScheduler {
  constructor(
    private readonly redisService: RedisService,
    private readonly eventService: EventEmitter2,
    private readonly feedService: FeedService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetTrendTable() {
    await this.redisService.del(redisKeys.FEED_TREND_KEY);
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async analyzeTrend() {
    const [originTrend, nowTrend] = await Promise.all([
      this.redisService.lrange(redisKeys.FEED_ORIGIN_TREND_KEY, 0, 3),
      this.redisService.zrevrange(redisKeys.FEED_TREND_KEY, 0, 3),
    ]);

    if (!_.isEqual(originTrend, nowTrend)) {
      await this.redisService.executePipeline((pipeline) => {
        pipeline.del(redisKeys.FEED_ORIGIN_TREND_KEY);
        pipeline.rpush(redisKeys.FEED_ORIGIN_TREND_KEY, ...nowTrend);
      });
      const trendFeeds = await this.feedService.readTrendFeedList();
      this.eventService.emit('ranking-update', trendFeeds);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetIpTable() {
    const keys = await this.redisService.keys(redisKeys.FEED_ALL_IP_KEY);

    if (keys.length > 0) {
      await this.redisService.del(...keys);
    }
  }
}
