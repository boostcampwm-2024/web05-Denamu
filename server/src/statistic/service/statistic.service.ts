import { StatisticAllResponseDto } from './../dto/response/all-view-count.dto';
import { RssAcceptRepository } from '../../rss/repository/rss.repository';
import { Injectable } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';
import { FeedRepository } from '../../feed/repository/feed.repository';
import { redisKeys } from '../../common/redis/redis.constant';
import { StatisticPlatformResponseDto } from '../dto/response/platform.dto';
import { StatisticTodayResponseDto } from '../dto/response/today.dto';
import { Feed } from '../../feed/entity/feed.entity';
import { StatisticRequestDto } from '../dto/request/statistic-query.dto';

@Injectable()
export class StatisticService {
  constructor(
    private readonly redisService: RedisService,
    private readonly feedRepository: FeedRepository,
    private readonly rssAcceptRepository: RssAcceptRepository,
  ) {}

  async readTodayStatistic(statisticQueryDto: StatisticRequestDto) {
    const ranking = await this.redisService.zrevrange(
      redisKeys.FEED_TREND_KEY,
      0,
      statisticQueryDto.limit - 1,
      'WITHSCORES',
    );
    const todayFeedViews: Partial<Feed>[] = [];

    for (let i = 0; i < ranking.length; i += 2) {
      const feedId = parseInt(ranking[i]);
      const score = parseFloat(ranking[i + 1]);

      const feedData = await this.feedRepository.findOne({
        where: { id: feedId },
        relations: ['blog'],
      });

      todayFeedViews.push({
        id: feedData.id,
        title: feedData.title,
        viewCount: score,
      });
    }

    return StatisticTodayResponseDto.toResponseDtoArray(todayFeedViews);
  }

  async readAllStatistic(statisticQueryDto: StatisticRequestDto) {
    const ranking = await this.feedRepository.findAllStatisticsOrderByViewCount(
      statisticQueryDto.limit,
    );
    return StatisticAllResponseDto.toResponseDtoArray(ranking);
  }

  async readPlatformStatistic() {
    const platformStatistics =
      await this.rssAcceptRepository.countByBlogPlatform();
    return StatisticPlatformResponseDto.toResponseDtoArray(platformStatistics);
  }
}
