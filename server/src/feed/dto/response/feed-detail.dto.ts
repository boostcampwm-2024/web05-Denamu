import { FeedView } from '../../entity/feed.entity';

export class FeedDetailResponseDto {
  private constructor(
    private id: number,
    private author: string,
    private blogPlatform: string,
    private title: string,
    private path: string,
    private createdAt: Date,
    private thumbnail: string,
    private viewCount: number,
    private summary: string,
    private likes: number,
    private comments: number,
    private tag: string[],
  ) {}

  static toResponseDto(feed: FeedView) {
    return new FeedDetailResponseDto(
      feed.feedId,
      feed.blogName,
      feed.blogPlatform,
      feed.title,
      feed.path,
      feed.createdAt,
      feed.thumbnail,
      feed.viewCount,
      feed.summary,
      feed.likeCount,
      feed.commentCount,
      feed.tag ? feed.tag : [],
    );
  }

  static toResponseDtoArray(feeds) {
    return feeds.map(this.toResponseDto);
  }
}
