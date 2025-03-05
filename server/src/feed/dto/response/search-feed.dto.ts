import { Feed } from '../../entity/feed.entity';

export class SearchFeedResult {
  private constructor(
    private id: number,
    private blogName: string,
    private title: string,
    private path: string,
    private createdAt: Date,
  ) {}

  static toResultDto(feed: Feed) {
    return new SearchFeedResult(
      feed.id,
      feed.blog.name,
      feed.title,
      feed.path,
      feed.createdAt,
    );
  }

  static toResultDtoArray(feeds: Feed[]) {
    return feeds.map(this.toResultDto);
  }
}

export class SearchFeedResponseDto {
  private constructor(
    private totalCount: number,
    private result: SearchFeedResult[],
    private totalPages: number,
    private limit: number,
  ) {}

  static toResponseDto(
    totalCount: number,
    feeds: SearchFeedResult[],
    totalPages: number,
    limit: number,
  ) {
    return new SearchFeedResponseDto(totalCount, feeds, totalPages, limit);
  }
}
