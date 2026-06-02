import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ActivityService } from '@activity/service/activity.service';

import { RedisService } from '@common/redis/redis.service';

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
    const hasUserFlag = await this.redisService.sismember(
      `feed:${feedId}:userId`,
      userId,
    );

    if (hasUserFlag) return;

    await this.redisService.sadd(`feed:${feedId}:userId`, userId);
    await this.userService.updateUserActivity(userId);
    await this.activityService.upsertActivity(userId);
  }
}
