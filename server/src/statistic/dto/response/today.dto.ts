import { Feed } from '../../../feed/entity/feed.entity';

export class StatisticTodayResponseDto {
  private constructor(
    private id: number,
    private title: string,
    private viewCount: number,
  ) {}

  static toResponseDto(todayViewCount: Partial<Feed>) {
    return new StatisticTodayResponseDto(
      todayViewCount.id,
      todayViewCount.title,
      todayViewCount.viewCount,
    );
  }

  static toResponseDtoArray(todayViewCountList: Partial<Feed>[]) {
    return todayViewCountList.map(this.toResponseDto);
  }
}
