import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import axios from 'axios';
import { Request, Response } from 'express';

import { RssBlockRepository } from '@block/repository/rssBlock.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';
import { getIp } from '@common/util/getIp';

import { AI_RETRY_LOCK_TTL_SECONDS } from '@feed/constant/feed.constant';
import { ManageFeedRequestDto } from '@feed/dto/request/manageFeed.dto';
import { ReadFeedPaginationRequestDto } from '@feed/dto/request/readFeedPagination.dto';
import { SearchFeedRequestDto } from '@feed/dto/request/searchFeed.dto';
import { GetFeedDetailResponseDto } from '@feed/dto/response/getFeedDetail';
import {
  FeedPaginationResult,
  FeedResult,
  FeedTrendResponseDto,
  ReadFeedPaginationResponseDto,
} from '@feed/dto/response/readFeedPagination.dto';
import {
  FeedRecentRedis,
  ReadFeedRecentResponseDto,
} from '@feed/dto/response/readFeedRecent.dto';
import { ReadNoSummaryFeedResponseDto } from '@feed/dto/response/readNoSummaryFeed.dto';
import { ReadSubscriptionFeedResponseDto } from '@feed/dto/response/readSubscriptionFeed.dto';
import {
  SearchFeedResponseDto,
  SearchFeedResult,
} from '@feed/dto/response/searchFeed.dto';
import { FeedView } from '@feed/entity/feed.entity';
import {
  FeedRepository,
  FeedViewRepository,
} from '@feed/repository/feed.repository';
import { existNextFeed, getLastIdFromFeedList } from '@feed/util/pagination';
import { createCookie, isString } from '@feed/util/viewCookie';

import { SubscriptionRepository } from '@subscribe/repository/subscription.repository';

type AiSummaryRetryMessage = {
  feedId: number;
  deathCount: number;
};

@Injectable()
export class FeedService {
  constructor(
    private readonly feedRepository: FeedRepository,
    private readonly feedViewRepository: FeedViewRepository,
    private readonly redisService: RedisService,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly rssBlockRepository: RssBlockRepository,
  ) {}

  async getFeed(feedId: number) {
    const feed = await this.feedRepository.findOneBy({ id: feedId });
    if (!feed) {
      throw new NotFoundException('존재하지 않는 게시글입니다.');
    }

    return feed;
  }

  async getPublicFeed(feedId: number) {
    const feed = await this.getFeed(feedId);
    if (!feed.isPublic) {
      throw new NotFoundException('존재하지 않는 게시글입니다.');
    }

    return feed;
  }

  async readFeedsWithoutSummary() {
    const feeds = await this.feedRepository.findFeedsWithoutSummary();
    return ReadNoSummaryFeedResponseDto.toResponseDtoArray(feeds);
  }

  async requestAiSummary(feedId: number) {
    await this.getFeed(feedId);

    const lockKey = `${REDIS_KEYS.FEED_AI_RETRY_LOCK}:${feedId}`;
    const acquired = await this.redisService.set(
      lockKey,
      '1',
      'NX',
      'EX',
      AI_RETRY_LOCK_TTL_SECONDS,
    );
    if (!acquired) {
      throw new ConflictException(
        '현재 이 게시글은 AI 큐에 포함되어 요약을 진행중입니다.',
      );
    }

    const message: AiSummaryRetryMessage = {
      feedId,
      deathCount: 0,
    };
    await this.redisService.rpush(
      REDIS_KEYS.FEED_AI_RETRY_QUEUE,
      JSON.stringify(message),
    );
  }

  async getFeedByView(feedId: number) {
    const feed = await this.feedViewRepository.findOneBy({ feedId });
    if (!feed) {
      throw new NotFoundException('존재하지 않는 게시글입니다.');
    }

    return feed;
  }

  async readFeedPagination(
    feedPaginationQueryDto: ReadFeedPaginationRequestDto,
    blockerId?: number,
  ) {
    const feedList = await this.feedViewRepository.findFeedPagination(
      feedPaginationQueryDto,
      blockerId,
    );

    const hasMore = existNextFeed(feedList, feedPaginationQueryDto.limit);
    if (hasMore) feedList.pop();
    const lastId = getLastIdFromFeedList(feedList);
    const newCheckFeedList = await this.checkNewFeeds(feedList);
    const feedPagination = FeedResult.toResultDtoArray(newCheckFeedList);
    return ReadFeedPaginationResponseDto.toResponseDto(
      feedPagination,
      lastId,
      hasMore,
    );
  }

  private async checkNewFeeds(feedList: FeedView[]) {
    const newFeedIds = (
      await this.redisService.keys(REDIS_KEYS.FEED_RECENT_ALL_KEY)
    ).map((key) => {
      const feedId = key.match(/feed:recent:(\d+)/);
      return parseInt(feedId[1]);
    });

    return feedList.map((feed): FeedPaginationResult => {
      return {
        ...feed,
        isNew: newFeedIds.includes(feed.feedId),
      };
    });
  }

  async readTrendFeedList() {
    const trendFeedIdList = await this.redisService.lrange(
      REDIS_KEYS.FEED_ORIGIN_TREND_KEY,
      0,
      -1,
    );
    const trendFeeds = await Promise.all(
      trendFeedIdList.map(async (feedId) =>
        this.feedViewRepository.findOneBy({ feedId: parseInt(feedId) }),
      ),
    );
    return FeedTrendResponseDto.toResponseDtoArray(
      trendFeeds.filter((feed) => feed !== null),
    );
  }

  async searchFeedList(
    searchFeedQueryDto: SearchFeedRequestDto,
    blockerId?: number,
  ) {
    const { find, page, limit, type } = searchFeedQueryDto;
    const offset = (page - 1) * limit;

    const [searchResult, totalCount] = await this.feedRepository.searchFeedList(
      find,
      limit,
      type,
      offset,
      blockerId,
    );

    const feeds = SearchFeedResult.toResultDtoArray(searchResult);
    const totalPages = Math.ceil(totalCount / limit);

    return SearchFeedResponseDto.toResponseDto(
      totalCount,
      feeds,
      totalPages,
      limit,
    );
  }

  async updateFeedViewCount(
    viewUpdateParamDto: ManageFeedRequestDto,
    request: Request,
    response: Response,
  ) {
    const feedId = viewUpdateParamDto.feedId;
    await this.getFeed(feedId);

    const cookie = request.headers.cookie;
    const ip = getIp(request);

    if (!ip || !isString(ip)) {
      return;
    }

    const cookieKey = `View_count_${feedId}=${feedId}`;
    const hasCookie = Boolean(cookie?.includes(cookieKey));

    if (hasCookie) {
      return;
    }

    const hasIpFlag = await this.redisService.sismember(
      `feed:${feedId}:ip`,
      ip,
    );

    if (hasIpFlag) {
      createCookie(response, feedId);
      return;
    }

    createCookie(response, feedId);

    await Promise.all([
      this.redisService.sadd(`feed:${feedId}:ip`, ip),
      this.feedRepository.update(feedId, {
        viewCount: () => 'view_count + 1',
      }),
      this.redisService.zincrby(
        REDIS_KEYS.FEED_TREND_KEY,
        1,
        feedId.toString(),
      ),
    ]);
  }

  async readRecentFeedList() {
    const recentKeys = await this.redisService.keys(
      REDIS_KEYS.FEED_RECENT_ALL_KEY,
    );

    if (!recentKeys.length) {
      return [];
    }

    const recentFeeds = await this.redisService.executePipeline((pipeline) => {
      for (const key of recentKeys) {
        pipeline.hgetall(key);
      }
    });

    const recentFeedList = recentFeeds
      .filter(([err]) => !err)
      .map(([, feed]) => feed as FeedRecentRedis)
      .map((feed) => ({
        ...feed,
        tagList:
          typeof feed.tagList === 'string' ? feed.tagList.split(',') : [],
        isNew: true,
      }))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    return ReadFeedRecentResponseDto.toResponseDtoArray(recentFeedList);
  }

  async getFeedDetail(
    feedDetailRequestDto: ManageFeedRequestDto,
    userId?: number,
  ) {
    const feed = await this.getFeedByView(feedDetailRequestDto.feedId);
    const blogMeta = await this.feedRepository.getBlogMetaByFeedId(
      feedDetailRequestDto.feedId,
    );
    const isOwner = userId
      ? await this.feedRepository.isOwnedByUser(
          feedDetailRequestDto.feedId,
          userId,
        )
      : false;

    let isSubscribed = false;
    if (userId) {
      const subscription = await this.subscriptionRepository.findOneBy({
        user: { id: userId },
        rssAccept: { id: blogMeta.id },
      });
      isSubscribed = !!subscription;
    }

    let isBlocked = false;
    if (userId) {
      isBlocked = await this.rssBlockRepository.existsByBlockerAndRss(
        userId,
        blogMeta.id,
      );
    }

    return GetFeedDetailResponseDto.toResponseDto(
      feed,
      isOwner,
      blogMeta,
      isSubscribed,
      isBlocked,
    );
  }

  async readSubscriptionFeeds(
    userId: number,
    feedPaginationQueryDto: ReadFeedPaginationRequestDto,
  ) {
    const limit = feedPaginationQueryDto.limit ?? 12;
    const [blogIds, blockedRssIds] = await Promise.all([
      this.subscriptionRepository.getSubscribedBlogIds(userId),
      this.rssBlockRepository.getBlockedRssIds(userId),
    ]);
    const visibleBlogIds = blogIds.filter(
      (blogId) => !blockedRssIds.includes(blogId),
    );
    const feeds = await this.feedRepository.getSubscriptionFeeds(
      visibleBlogIds,
      feedPaginationQueryDto.lastId ?? 0,
      limit,
    );

    const hasMore = feeds.length > limit;
    if (hasMore) feeds.pop();
    const lastId = feeds.length ? feeds[feeds.length - 1].id : 0;

    return ReadSubscriptionFeedResponseDto.toResponseDto(
      feeds,
      lastId,
      hasMore,
    );
  }

  async deleteCheckFeed(feedDeleteCheckDto: ManageFeedRequestDto) {
    const feed = await this.getFeed(feedDeleteCheckDto.feedId);
    const response = await axios.get(feed.path, { validateStatus: () => true });

    if (response.status === Number(HttpStatus.NOT_FOUND)) {
      await this.feedRepository.delete({ id: feedDeleteCheckDto.feedId });
      throw new NotFoundException('원본 게시글이 삭제되었습니다.');
    }
  }
}
