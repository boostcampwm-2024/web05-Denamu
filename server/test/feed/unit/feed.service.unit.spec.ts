import { ConflictException, NotFoundException } from '@nestjs/common';

import axios from 'axios';
import { Request, Response } from 'express';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { ReadFeedPaginationRequestDto } from '@feed/dto/request/readFeedPagination.dto';
import { SearchFeedRequestDto } from '@feed/dto/request/searchFeed.dto';
import { GetFeedDetailResponseDto } from '@feed/dto/response/getFeedDetail';
import { ReadNoSummaryFeedResponseDto } from '@feed/dto/response/readNoSummaryFeed.dto';
import {
  FeedRepository,
  FeedViewRepository,
} from '@feed/repository/feed.repository';
import { FeedService } from '@feed/service/feed.service';

import { RssBlockRepository } from '@block/repository/rssBlock.repository';

import { SubscriptionRepository } from '@subscribe/repository/subscription.repository';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe(`${FeedService.name} Unit Test`, () => {
  let feedService: FeedService;
  let feedRepository: jest.Mocked<
    Pick<
      FeedRepository,
      | 'findOneBy'
      | 'searchFeedList'
      | 'update'
      | 'delete'
      | 'isOwnedByUser'
      | 'getBlogMetaByFeedId'
      | 'findFeedsWithoutSummary'
    >
  >;
  let feedViewRepository: jest.Mocked<
    Pick<FeedViewRepository, 'findOneBy' | 'findFeedPagination'>
  >;
  let subscriptionRepository: jest.Mocked<
    Pick<SubscriptionRepository, 'findOneBy' | 'getSubscribedBlogIds'>
  >;
  let rssBlockRepository: jest.Mocked<
    Pick<RssBlockRepository, 'existsByBlockerAndRss'>
  >;
  let redisService: jest.Mocked<
    Pick<
      RedisService,
      | 'keys'
      | 'lrange'
      | 'sismember'
      | 'sadd'
      | 'zincrby'
      | 'executePipeline'
      | 'rpush'
      | 'set'
    >
  >;

  const createResponse = () => ({ cookie: jest.fn() }) as unknown as Response;

  beforeEach(() => {
    jest.clearAllMocks();
    feedRepository = {
      findOneBy: jest.fn(),
      searchFeedList: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      isOwnedByUser: jest.fn(),
      getBlogMetaByFeedId: jest.fn().mockResolvedValue(null),
      findFeedsWithoutSummary: jest.fn(),
    };
    feedViewRepository = {
      findOneBy: jest.fn(),
      findFeedPagination: jest.fn(),
    };
    redisService = {
      keys: jest.fn(),
      lrange: jest.fn(),
      sismember: jest.fn(),
      sadd: jest.fn(),
      zincrby: jest.fn(),
      executePipeline: jest.fn(),
      rpush: jest.fn(),
      set: jest.fn().mockResolvedValue('OK'),
    };

    subscriptionRepository = {
      findOneBy: jest.fn(),
      getSubscribedBlogIds: jest.fn().mockResolvedValue([]),
    };

    rssBlockRepository = {
      existsByBlockerAndRss: jest.fn().mockResolvedValue(false),
    };

    feedService = new FeedService(
      feedRepository as unknown as FeedRepository,
      feedViewRepository as unknown as FeedViewRepository,
      redisService as unknown as RedisService,
      subscriptionRepository as unknown as SubscriptionRepository,
      rssBlockRepository as unknown as RssBlockRepository,
    );
  });

  describe('getFeed', () => {
    it('존재하지 않으면 NotFoundException을 던진다.', async () => {
      feedRepository.findOneBy.mockResolvedValue(null);
      await expect(feedService.getFeed(1)).rejects.toThrow(NotFoundException);
    });

    it('존재하면 피드를 반환한다.', async () => {
      const feed = { id: 1 } as any;
      feedRepository.findOneBy.mockResolvedValue(feed);
      await expect(feedService.getFeed(1)).resolves.toBe(feed);
    });
  });

  describe('getPublicFeed', () => {
    it('존재하지 않으면 NotFoundException을 던진다.', async () => {
      feedRepository.findOneBy.mockResolvedValue(null);
      await expect(feedService.getPublicFeed(1)).rejects.toThrow(NotFoundException);
    });

    it('비공개 게시글이면 NotFoundException을 던진다.', async () => {
      feedRepository.findOneBy.mockResolvedValue({ id: 1, isPublic: false } as any);
      await expect(feedService.getPublicFeed(1)).rejects.toThrow(NotFoundException);
    });

    it('공개 게시글이면 피드를 반환한다.', async () => {
      const feed = { id: 1, isPublic: true } as any;
      feedRepository.findOneBy.mockResolvedValue(feed);
      await expect(feedService.getPublicFeed(1)).resolves.toBe(feed);
    });
  });

  describe('getFeedByView', () => {
    it('존재하지 않으면 NotFoundException을 던진다.', async () => {
      feedViewRepository.findOneBy.mockResolvedValue(null);
      await expect(feedService.getFeedByView(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('requestAiSummary', () => {
    const parseEnqueued = () =>
      JSON.parse(redisService.rpush.mock.calls[0][1] as string);

    it('존재하지 않는 피드면 NotFoundException을 던지고 큐에 넣지 않는다.', async () => {
      // given
      feedRepository.findOneBy.mockResolvedValue(null);

      // when & then
      await expect(feedService.requestAiSummary(7)).rejects.toThrow(
        NotFoundException,
      );
      expect(redisService.rpush).not.toHaveBeenCalled();
    });

    it('요약이 NULL(영구 실패)이면 deathCount 0으로 재요청 큐에 넣는다.', async () => {
      // given
      feedRepository.findOneBy.mockResolvedValue({
        id: 7,
        summary: null,
      } as any);

      // when
      await feedService.requestAiSummary(7);

      // then
      expect(redisService.set).toHaveBeenCalledWith(
        `${REDIS_KEYS.FEED_AI_RETRY_LOCK}:7`,
        '1',
        'NX',
        'EX',
        expect.any(Number),
      );
      expect(redisService.rpush).toHaveBeenCalledWith(
        REDIS_KEYS.FEED_AI_RETRY_QUEUE,
        expect.any(String),
      );
      expect(parseEnqueued()).toMatchObject({ feedId: 7, deathCount: 0 });
    });

    it('이미 처리 중(락 점유)이면 ConflictException을 던지고 큐에 넣지 않는다.', async () => {
      // given
      feedRepository.findOneBy.mockResolvedValue({
        id: 7,
        summary: null,
      } as any);
      redisService.set.mockResolvedValue(null); // NX 실패 = 이미 락 존재

      // when & then
      await expect(feedService.requestAiSummary(7)).rejects.toThrow(
        ConflictException,
      );
      expect(redisService.rpush).not.toHaveBeenCalled();
    });
  });

  describe('readFeedsWithoutSummary', () => {
    it('레포지토리 조회 결과를 응답 DTO 배열로 변환해 반환한다.', async () => {
      // given
      const feeds = [
        { id: 2, title: 'b', likeCount: 5, commentCount: 1 },
        { id: 1, title: 'a', likeCount: 0, commentCount: 0 },
      ] as any[];
      feedRepository.findFeedsWithoutSummary.mockResolvedValue(feeds);

      // when
      const result = await feedService.readFeedsWithoutSummary();

      // then
      expect(feedRepository.findFeedsWithoutSummary).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(
        ReadNoSummaryFeedResponseDto.toResponseDtoArray(feeds),
      );
    });

    it('조회 결과가 없으면 빈 배열을 반환한다.', async () => {
      // given
      feedRepository.findFeedsWithoutSummary.mockResolvedValue([]);

      // when
      const result = await feedService.readFeedsWithoutSummary();

      // then
      expect(result).toStrictEqual([]);
    });
  });

  describe('readFeedPagination', () => {
    it('limit보다 많이 조회되면 hasMore=true로 마지막 1건을 잘라낸다.', async () => {
      // given
      const dto = { limit: 2 } as ReadFeedPaginationRequestDto;
      const feedList = [{ feedId: 1 }, { feedId: 2 }, { feedId: 3 }] as any[];
      feedViewRepository.findFeedPagination.mockResolvedValue(feedList);
      redisService.keys.mockResolvedValue(['feed:recent:2']);

      // when
      const result = await feedService.readFeedPagination(dto);

      // then
      expect(result.hasMore).toBe(true);
      expect(result.lastId).toBe(2);
      expect(result.result).toHaveLength(2);
      expect(result.result.find((f) => f.id === 2).isNew).toBe(true);
      expect(result.result.find((f) => f.id === 1).isNew).toBe(false);
    });

    it('limit 이하면 hasMore=false이고 잘라내지 않는다.', async () => {
      // given
      const dto = { limit: 5 } as ReadFeedPaginationRequestDto;
      feedViewRepository.findFeedPagination.mockResolvedValue([
        { feedId: 1 },
      ] as any);
      redisService.keys.mockResolvedValue([]);

      // when
      const result = await feedService.readFeedPagination(dto);

      // then
      expect(result.hasMore).toBe(false);
      expect(result.lastId).toBe(1);
      expect(result.result).toHaveLength(1);
    });
  });

  describe('readTrendFeedList', () => {
    it('트렌드 ID 목록으로 피드를 조회하고 null을 제외한다.', async () => {
      // given
      redisService.lrange.mockResolvedValue(['1', '2']);
      feedViewRepository.findOneBy.mockImplementation((where) =>
        Promise.resolve(
          (where as { feedId: number }).feedId === 1
            ? ({ feedId: 1, tag: [] } as any)
            : null,
        ),
      );

      // when
      const result = await feedService.readTrendFeedList();

      // then
      expect(redisService.lrange).toHaveBeenCalledWith(
        REDIS_KEYS.FEED_ORIGIN_TREND_KEY,
        0,
        -1,
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });
  });

  describe('searchFeedList', () => {
    it('offset과 totalPages를 계산하고 검색을 위임한다.', async () => {
      // given
      const dto = {
        find: 'nest',
        page: 2,
        limit: 10,
        type: 'title',
      } as SearchFeedRequestDto;
      feedRepository.searchFeedList.mockResolvedValue([[], 25] as any);

      // when
      const result = await feedService.searchFeedList(dto);

      // then
      expect(feedRepository.searchFeedList).toHaveBeenCalledWith(
        'nest',
        10,
        'title',
        10, // offset = (2-1)*10
        undefined,
      );
      expect(result.totalCount).toBe(25);
      expect(result.totalPages).toBe(3); // ceil(25/10)
    });
  });

  describe('updateFeedViewCount', () => {
    const dto = { feedId: 10 };

    const createRequest = (
      overwrites: Partial<{ cookie: string; xff: string }> = {},
    ) =>
      ({
        headers: {
          cookie: overwrites.cookie,
          'x-forwarded-for': overwrites.xff ?? '1.2.3.4',
        },
        socket: { remoteAddress: '1.2.3.4' },
      }) as unknown as Request;

    it('이미 조회 쿠키가 있으면 조회수를 증가시키지 않는다.', async () => {
      // given
      feedRepository.findOneBy.mockResolvedValue({ id: 10 } as any);
      const request = createRequest({ cookie: 'View_count_10=10' });

      // when
      await feedService.updateFeedViewCount(dto, request, createResponse());

      // then
      expect(feedRepository.update).not.toHaveBeenCalled();
    });

    it('IP 플래그가 있으면 쿠키만 발급하고 조회수는 증가시키지 않는다.', async () => {
      // given
      feedRepository.findOneBy.mockResolvedValue({ id: 10 } as any);
      redisService.sismember.mockResolvedValue(1);
      const cookie = jest.fn();
      const response = { cookie } as unknown as Response;

      // when
      await feedService.updateFeedViewCount(dto, createRequest(), response);

      // then
      expect(cookie).toHaveBeenCalled();
      expect(feedRepository.update).not.toHaveBeenCalled();
    });

    it('신규 조회면 IP를 등록하고 조회수와 트렌드 점수를 증가시킨다.', async () => {
      // given
      feedRepository.findOneBy.mockResolvedValue({ id: 10 } as any);
      redisService.sismember.mockResolvedValue(0);
      const response = createResponse();

      // when
      await feedService.updateFeedViewCount(dto, createRequest(), response);

      // then
      expect(redisService.sadd).toHaveBeenCalledWith('feed:10:ip', '1.2.3.4');
      expect(feedRepository.update).toHaveBeenCalledWith(10, {
        viewCount: expect.any(Function),
      });
      expect(redisService.zincrby).toHaveBeenCalledWith(
        REDIS_KEYS.FEED_TREND_KEY,
        1,
        '10',
      );
    });
  });

  describe('readRecentFeedList', () => {
    it('최근 피드 키가 없으면 빈 배열을 반환한다.', async () => {
      // given
      redisService.keys.mockResolvedValue([]);

      // when
      const result = await feedService.readRecentFeedList();

      // then
      expect(result).toStrictEqual([]);
      expect(redisService.executePipeline).not.toHaveBeenCalled();
    });

    it('파이프라인 결과를 최신순으로 정렬하고 태그를 분리한다.', async () => {
      // given
      redisService.keys.mockResolvedValue(['feed:recent:1', 'feed:recent:2']);
      redisService.executePipeline.mockResolvedValue([
        [null, { id: '1', createdAt: '2025-01-01', tagList: 'a,b' }],
        [null, { id: '2', createdAt: '2025-02-01', tagList: 'c' }],
      ] as any);

      // when
      const result = await feedService.readRecentFeedList();

      // then
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(2);
    });
  });

  describe('getFeedDetail', () => {
    const blogMeta = { id: 1, userName: '조민석', userId: 5 };

    it('피드 뷰를 조회하고 상세 응답으로 변환한다.', async () => {
      // given
      const feed = { feedId: 10, title: 'detail', tag: ['a'] } as any;
      feedViewRepository.findOneBy.mockResolvedValue(feed);
      feedRepository.getBlogMetaByFeedId.mockResolvedValue(blogMeta);

      // when
      const result = await feedService.getFeedDetail({
        feedId: 10,
      });

      // then
      expect(feedViewRepository.findOneBy).toHaveBeenCalledWith({ feedId: 10 });
      expect(feedRepository.isOwnedByUser).not.toHaveBeenCalled();
      expect(result).toEqual(
        GetFeedDetailResponseDto.toResponseDto(feed, false, blogMeta),
      );
    });

    it('RSS 소유자가 조회하면 isOwner=true로 응답한다.', async () => {
      // given
      const feed = { feedId: 10, title: 'detail', tag: ['a'] } as any;
      feedViewRepository.findOneBy.mockResolvedValue(feed);
      feedRepository.isOwnedByUser.mockResolvedValue(true);
      feedRepository.getBlogMetaByFeedId.mockResolvedValue(blogMeta);

      // when
      const result = await feedService.getFeedDetail({ feedId: 10 }, 7);

      // then
      expect(feedRepository.isOwnedByUser).toHaveBeenCalledWith(10, 7);
      expect(result).toEqual(
        GetFeedDetailResponseDto.toResponseDto(feed, true, blogMeta),
      );
    });

    it('소유자가 아니면 isOwner=false로 응답한다.', async () => {
      // given
      const feed = { feedId: 10, title: 'detail', tag: ['a'] } as any;
      feedViewRepository.findOneBy.mockResolvedValue(feed);
      feedRepository.isOwnedByUser.mockResolvedValue(false);
      feedRepository.getBlogMetaByFeedId.mockResolvedValue(blogMeta);

      // when
      const result = await feedService.getFeedDetail({ feedId: 10 }, 7);

      // then
      expect(feedRepository.isOwnedByUser).toHaveBeenCalledWith(10, 7);
      expect(result).toEqual(
        GetFeedDetailResponseDto.toResponseDto(feed, false, blogMeta),
      );
    });
  });

  describe('deleteCheckFeed', () => {
    const dto = { feedId: 10 };

    it('원본이 404면 피드를 삭제하고 NotFoundException을 던진다.', async () => {
      // given
      feedRepository.findOneBy.mockResolvedValue({
        id: 10,
        path: 'https://blog.test/post',
      } as any);
      mockedAxios.get.mockResolvedValue({ status: 404 });

      // when & then
      await expect(feedService.deleteCheckFeed(dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(feedRepository.delete).toHaveBeenCalledWith({ id: 10 });
    });

    it('원본이 살아있으면 삭제하지 않는다.', async () => {
      // given
      feedRepository.findOneBy.mockResolvedValue({
        id: 10,
        path: 'https://blog.test/post',
      } as any);
      mockedAxios.get.mockResolvedValue({ status: 200 });

      // when
      await feedService.deleteCheckFeed(dto);

      // then
      expect(feedRepository.delete).not.toHaveBeenCalled();
    });
  });
});
