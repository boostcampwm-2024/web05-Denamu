import { FeedView } from '../../entity/feed.entity';

export class FeedResult {
  private constructor(
    private id: number,
    private author: string,
    private blogPlatform: string,
    private title: string,
    private path: string,
    private createdAt: Date,
    private thumbnail: string,
    private viewCount: number,
    private isNew: boolean,
    private tag: string[],
  ) {}

  private static toResultDto(feed: FeedPaginationResult) {
    return new FeedResult(
      feed.feedId,
      feed.blogName,
      feed.blogPlatform,
      feed.title,
      feed.path,
      feed.createdAt,
      feed.thumbnail,
      feed.viewCount,
      feed.isNew,
      feed.tag?.split(',') ?? [],
    );
  }

  public static toResultDtoArray(feedList: FeedPaginationResult[]) {
    return feedList.map(this.toResultDto);
  }
}

export class FeedPaginationResponseDto {
  private constructor(
    private result: FeedResult[],
    private lastId: number,
    private hasMore: boolean,
  ) {}

  static toResponseDto(
    feedPagination: FeedResult[],
    lastId: number,
    hasMore: boolean,
  ) {
    return new FeedPaginationResponseDto(feedPagination, lastId, hasMore);
  }
}

export type FeedPaginationResult = FeedView & { isNew: boolean };

export class FeedTrendResponseDto {
  private constructor(
    private id: number,
    private author: string,
    private blogPlatform: string,
    private title: string,
    private path: string,
    private createdAt: Date,
    private thumbnail: string,
    private viewCount: number,
    private tag: string[],
  ) {}

  private static toResponseDto(feed: FeedView) {
    return new FeedTrendResponseDto(
      feed.feedId,
      feed.blogName,
      feed.blogPlatform,
      feed.title,
      feed.path,
      feed.createdAt,
      feed.thumbnail,
      feed.viewCount,
      feed.tag?.split(',') ?? [],
    );
  }

  public static toResponseDtoArray(FeedList: FeedView[]) {
    return FeedList.map(this.toResponseDto);
  }
}
