import { Feed } from '../../../feed/entity/feed.entity';

export class StatisticAllResponseDto {
  private constructor(
    private id: number,
    private title: string,
    private viewCount: number,
  ) {}

  static toResponseDto(feed: Feed) {
    return new StatisticAllResponseDto(feed.id, feed.title, feed.viewCount);
  }

  static toResponseDtoArray(feeds: Feed[]) {
    return feeds.map(this.toResponseDto);
  }
}
