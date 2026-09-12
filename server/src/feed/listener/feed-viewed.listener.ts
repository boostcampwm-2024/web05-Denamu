import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ActivityService } from '@activity/service/activity.service';

import { RedisService } from '@common/redis/redis.service';
import { getSecondsUntilNextKstMidnight } from '@common/util/kstDate';

import { FeedViewedEvent } from '@feed/event/feed-viewed.event';

import { UserService } from '@user/service/user.service';

@Injectable()
export class FeedViewedListener {
  constructor(
    private readonly redisService: RedisService,
    private readonly userService: UserService,
    private readonly activityService: ActivityService,
  ) {}

  @OnEvent('feed.viewed')
  async handleFeedViewed({ feedId, userId }: FeedViewedEvent) {
    const key = `feed:${feedId}:userId`;
    const hasUserFlag = await this.redisService.sismember(key, userId);

    if (hasUserFlag) return;

    await this.redisService.executePipeline((pipeline) => {
      pipeline.sadd(key, userId);
      pipeline.expire(key, getSecondsUntilNextKstMidnight());
    });
    await this.userService.updateUserActivity(userId);
    await this.activityService.upsertActivity(userId);
  }
}
