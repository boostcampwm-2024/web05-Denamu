import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import {
  FeedRepository,
  FeedViewRepository,
} from '../repository/feed.repository';
import { ReadFeedPaginationRequestDto } from '../dto/request/readFeedPagination.dto';
import { FeedView } from '../entity/feed.entity';
import {
  ReadFeedPaginationResponseDto,
  FeedPaginationResult,
  FeedResult,
  FeedTrendResponseDto,
} from '../dto/response/readFeedPagination.dto';
import { RedisService } from '../../common/redis/redis.service';
import { SearchFeedRequestDto } from '../dto/request/searchFeed.dto';
import { Response, Request } from 'express';
import { cookieConfig } from '../../common/cookie/cookie.config';
import { REDIS_KEYS } from '../../common/redis/redis.constant';
import {
  SearchFeedResponseDto,
  SearchFeedResult,
} from '../dto/response/searchFeed.dto';
import {
  FeedRecentRedis,
  ReadFeedRecentResponseDto,
} from '../dto/response/readFeedRecent.dto';
import { UpdateFeedViewCountRequestDto } from '../dto/request/updateFeedViewCount.dto';
import { GetFeedDetailRequestDto } from '../dto/request/getFeedDetail.dto';
import { GetFeedDetailResponseDto } from '../dto/response/getFeedDetail';
import { DeleteCheckFeedRequestDto } from '../dto/request/deleteCheckFeed.dto';

@Injectable()
export class FeedService {
  constructor(
    private readonly feedRepository: FeedRepository,
    private readonly feedViewRepository: FeedViewRepository,
    private readonly redisService: RedisService,
  ) {}

  async getFeed(feedId: number) {
    const feed = await this.feedRepository.findOneBy({ id: feedId });
    if (!feed) {
      throw new NotFoundException('존재하지 않는 게시글입니다.');
    }

    return feed;
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
  ) {
    const feedList = await this.feedViewRepository.findFeedPagination(
      feedPaginationQueryDto,
    );

    const hasMore = this.existNextFeed(feedList, feedPaginationQueryDto.limit);
    if (hasMore) feedList.pop();
    const lastId = this.getLastIdFromFeedList(feedList);
    const newCheckFeedList = await this.checkNewFeeds(feedList);
    const feedPagination = FeedResult.toResultDtoArray(newCheckFeedList);
    return ReadFeedPaginationResponseDto.toResponseDto(
      feedPagination,
      lastId,
      hasMore,
    );
  }

  private existNextFeed(feedList: FeedView[], limit: number) {
    return feedList.length > limit;
  }

  private getLastIdFromFeedList(feedList: FeedView[]) {
    return feedList.length ? feedList[feedList.length - 1].feedId : 0;
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

  async searchFeedList(searchFeedQueryDto: SearchFeedRequestDto) {
    const { find, page, limit, type } = searchFeedQueryDto;
    const offset = (page - 1) * limit;

    const [searchResult, totalCount] = await this.feedRepository.searchFeedList(
      find,
      limit,
      type,
      offset,
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
    viewUpdateParamDto: UpdateFeedViewCountRequestDto,
    request: Request,
    response: Response,
  ) {
    const cookie = request.headers.cookie;
    const ip = this.getIp(request);
    const feedId = viewUpdateParamDto.feedId;
    if (ip && this.isString(ip)) {
      const [_, hasCookie, hasIpFlag] = await Promise.all([
        this.getFeed(feedId),
        Boolean(cookie?.includes(`View_count_${feedId}=${feedId}`)),
        this.redisService.sismember(`feed:${feedId}:ip`, ip),
      ]);

      if (!hasCookie) {
        this.createCookie(response, feedId);
      }

      if (hasCookie || hasIpFlag) {
        return;
      }

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
  }

  private isString(ip: string | string[]): ip is string {
    return !Array.isArray(ip);
  }

  private createCookie(response: Response, feedId: number) {
    const cookieConfigWithExpiration = {
      ...cookieConfig[process.env.NODE_ENV],
      expires: this.getExpirationTime(),
    };
    response.cookie(`View_count_${feedId}`, feedId, cookieConfigWithExpiration);
  }

  private getExpirationTime() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
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

    let recentFeedList: FeedRecentRedis[] = recentFeeds.map(
      ([, feed]: [any, FeedRecentRedis]) => {
        const redisTagList = feed.tagList as string;
        feed.tagList = redisTagList ? redisTagList.split(',') : [];
        return { ...feed, isNew: true };
      },
    );

    recentFeedList = recentFeedList.sort((currentFeed, nextFeed) => {
      const dateCurrent = new Date(currentFeed.createdAt);
      const dateNext = new Date(nextFeed.createdAt);
      return dateNext.getTime() - dateCurrent.getTime();
    });

    return ReadFeedRecentResponseDto.toResponseDtoArray(recentFeedList);
  }

  private getIp(request: Request) {
    const forwardedFor = request.headers['x-forwarded-for'];

    if (typeof forwardedFor === 'string') {
      const forwardedIps = forwardedFor.split(',');
      return forwardedIps[0].trim();
    }

    return request.socket.remoteAddress;
  }

  async getFeedDetail(feedDetailRequestDto: GetFeedDetailRequestDto) {
    const feed = await this.getFeedByView(feedDetailRequestDto.feedId);
    return GetFeedDetailResponseDto.toResponseDto(feed);
  }

  async deleteCheckFeed(feedDeleteCheckDto: DeleteCheckFeedRequestDto) {
    const feed = await this.getFeed(feedDeleteCheckDto.feedId);
    const response = await fetch(feed.path);

    if (response.status === HttpStatus.NOT_FOUND) {
      await this.feedRepository.delete({ id: feedDeleteCheckDto.feedId });
      throw new NotFoundException('원본 게시글이 삭제되었습니다.');
    }
  }
}
