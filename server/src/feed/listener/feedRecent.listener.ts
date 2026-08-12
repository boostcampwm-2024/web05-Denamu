import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { CommentCreatedEvent } from '@comment/event/comment-created.event';
import { CommentDeletedEvent } from '@comment/event/comment-deleted.event';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { LikeCreatedEvent } from '@like/event/like-created.event';
import { LikeDeletedEvent } from '@like/event/like-deleted.event';

@Injectable()
export class FeedRecentListener {
  constructor(private readonly redisService: RedisService) {}

  @OnEvent('like.created')
  async handleLikeCreated({ feedId }: LikeCreatedEvent) {
    await this.redisService.hincrbyIfExists(
      REDIS_KEYS.FEED_INFO_ITEM_KEY(feedId),
      'likes',
      1,
    );
  }

  @OnEvent('like.deleted')
  async handleLikeDeleted({ feedId }: LikeDeletedEvent) {
    await this.redisService.hincrbyIfExists(
      REDIS_KEYS.FEED_INFO_ITEM_KEY(feedId),
      'likes',
      -1,
    );
  }

  @OnEvent('comment.created')
  async handleCommentCreated({ feedId }: CommentCreatedEvent) {
    await this.redisService.hincrbyIfExists(
      REDIS_KEYS.FEED_INFO_ITEM_KEY(feedId),
      'comments',
      1,
    );
  }

  @OnEvent('comment.deleted')
  async handleCommentDeleted({
    feedId,
    commentCountDelta,
  }: CommentDeletedEvent) {
    if (commentCountDelta === 0) return;

    await this.redisService.hincrbyIfExists(
      REDIS_KEYS.FEED_INFO_ITEM_KEY(feedId),
      'comments',
      commentCountDelta,
    );
  }
}
