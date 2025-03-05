import { RssAccept } from '../../../rss/entity/rss.entity';

export class StatisticPlatformResponseDto {
  private constructor(
    private platform: string,
    private count: number,
  ) {}

  static toResponseDto(platformStatistic: RssAccept) {
    return new StatisticPlatformResponseDto(
      platformStatistic['platform'],
      platformStatistic['count'],
    );
  }

  static toResponseDtoArray(platformStatistics: RssAccept[]) {
    return platformStatistics.map((platformStatistic: RssAccept) => {
      platformStatistic['count'] = parseInt(platformStatistic['count']);
      return this.toResponseDto(platformStatistic);
    });
  }
}
