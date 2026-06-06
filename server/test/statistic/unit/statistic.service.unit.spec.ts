import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { Feed } from '@feed/entity/feed.entity';
import { FeedRepository } from '@feed/repository/feed.repository';

import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { ReadStatisticRequestDto } from '@statistic/dto/request/readStatistic.dto';
import { ReadStatisticAllResponseDto } from '@statistic/dto/response/readStatisticAll.dto';
import { ReadStatisticPlatformResponseDto } from '@statistic/dto/response/readStatisticPlatform.dto';
import { ReadStatisticTodayResponseDto } from '@statistic/dto/response/readStatisticToday.dto';
import { StatisticService } from '@statistic/service/statistic.service';

describe(`${StatisticService.name} Unit Test`, () => {
  let statisticService: StatisticService;
  let redisService: jest.Mocked<Pick<RedisService, 'zrevrange'>>;
  let feedRepository: jest.Mocked<
    Pick<FeedRepository, 'findOne' | 'findAllStatisticsOrderByViewCount'>
  >;
  let rssAcceptRepository: jest.Mocked<
    Pick<RssAcceptRepository, 'countByBlogPlatform'>
  >;

  beforeEach(() => {
    redisService = { zrevrange: jest.fn() };
    feedRepository = {
      findOne: jest.fn(),
      findAllStatisticsOrderByViewCount: jest.fn(),
    };
    rssAcceptRepository = { countByBlogPlatform: jest.fn() };

    statisticService = new StatisticService(
      redisService as unknown as RedisService,
      feedRepository as unknown as FeedRepository,
      rssAcceptRepository as unknown as RssAcceptRepository,
    );
  });

  describe('readTodayStatistic', () => {
    const queryDto = { limit: 5 } as ReadStatisticRequestDto;

    it('zrevrange 결과(id/score 평탄 배열)를 2칸씩 묶어 피드를 조회하고 응답으로 변환한다.', async () => {
      // given
      redisService.zrevrange.mockResolvedValue(['1', '10', '2', '5']);
      feedRepository.findOne.mockImplementation((options) => {
        const id = (options.where as { id: number }).id;
        return Promise.resolve({ id, title: `title-${id}` } as Feed);
      });

      // when
      const result = await statisticService.readTodayStatistic(queryDto);

      // then
      expect(redisService.zrevrange).toHaveBeenCalledWith(
        REDIS_KEYS.FEED_TREND_KEY,
        0,
        queryDto.limit - 1,
        'WITHSCORES',
      );
      expect(feedRepository.findOne).toHaveBeenCalledTimes(2);
      expect(result).toEqual(
        ReadStatisticTodayResponseDto.toResponseDtoArray([
          { id: 1, title: 'title-1', viewCount: 10 },
          { id: 2, title: 'title-2', viewCount: 5 },
        ]),
      );
    });

    it('랭킹이 비어 있으면 빈 응답을 반환한다.', async () => {
      // given
      redisService.zrevrange.mockResolvedValue([]);

      // when
      const result = await statisticService.readTodayStatistic(queryDto);

      // then
      expect(feedRepository.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(
        ReadStatisticTodayResponseDto.toResponseDtoArray([]),
      );
    });
  });

  describe('readAllStatistic', () => {
    it('limit으로 통계를 조회하고 응답으로 변환한다.', async () => {
      // given
      const queryDto = { limit: 3 } as ReadStatisticRequestDto;
      const ranking = [{ id: 1, title: 'a', viewCount: 100 }] as any;
      feedRepository.findAllStatisticsOrderByViewCount.mockResolvedValue(
        ranking,
      );

      // when
      const result = await statisticService.readAllStatistic(queryDto);

      // then
      expect(
        feedRepository.findAllStatisticsOrderByViewCount,
      ).toHaveBeenCalledWith(queryDto.limit);
      expect(result).toEqual(
        ReadStatisticAllResponseDto.toResponseDtoArray(ranking),
      );
    });
  });

  describe('readPlatformStatistic', () => {
    it('플랫폼별 집계를 조회하고 응답으로 변환한다.', async () => {
      // given
      const platformStatistics = [{ platform: 'velog', count: 7 }] as any;
      rssAcceptRepository.countByBlogPlatform.mockResolvedValue(
        platformStatistics,
      );

      // when
      const result = await statisticService.readPlatformStatistic();

      // then
      expect(rssAcceptRepository.countByBlogPlatform).toHaveBeenCalled();
      expect(result).toEqual(
        ReadStatisticPlatformResponseDto.toResponseDtoArray(platformStatistics),
      );
    });
  });
});
