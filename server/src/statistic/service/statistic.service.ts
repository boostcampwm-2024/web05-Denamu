import { ReadStatisticAllResponseDto } from '../dto/response/readStatisticAll.dto';
import { RssAcceptRepository } from '../../rss/repository/rss.repository';
import { Injectable } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';
import { FeedRepository } from '../../feed/repository/feed.repository';
import { REDIS_KEYS } from '../../common/redis/redis.constant';
import { ReadStatisticPlatformResponseDto } from '../dto/response/readStatisticPlatform.dto';
import { ReadStatisticTodayResponseDto } from '../dto/response/readStatisticToday.dto';
import { Feed } from '../../feed/entity/feed.entity';
import { ReadStatisticRequestDto } from '../dto/request/readStatistic.dto';

@Injectable()
export class StatisticService {
  constructor(
    private readonly redisService: RedisService,
    private readonly feedRepository: FeedRepository,
    private readonly rssAcceptRepository: RssAcceptRepository,
  ) {}

  async readTodayStatistic(statisticQueryDto: ReadStatisticRequestDto) {
    const ranking = await this.redisService.zrevrange(
      REDIS_KEYS.FEED_TREND_KEY,
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

    return ReadStatisticTodayResponseDto.toResponseDtoArray(todayFeedViews);
  }

  async readAllStatistic(statisticQueryDto: ReadStatisticRequestDto) {
    const ranking = await this.feedRepository.findAllStatisticsOrderByViewCount(
      statisticQueryDto.limit,
    );
    return ReadStatisticAllResponseDto.toResponseDtoArray(ranking);
  }

  async readPlatformStatistic() {
    const platformStatistics =
      await this.rssAcceptRepository.countByBlogPlatform();
    return ReadStatisticPlatformResponseDto.toResponseDtoArray(
      platformStatistics,
    );
  }
}
