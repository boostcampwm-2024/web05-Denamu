import { ApiProperty } from '@nestjs/swagger';
import { Feed } from '@feed/entity/feed.entity';

export class SearchFeedResult {
  private constructor(
    private id: number,
    private blogName: string,
    private title: string,
    private path: string,
    private createdAt: Date,
    private likes: number,
    private comments: number,
  ) {}

  static toResultDto(feed: Feed) {
    return new SearchFeedResult(
      feed.id,
      feed.blog.name,
      feed.title,
      feed.path,
      feed.createdAt,
      feed.likeCount,
      feed.commentCount,
    );
  }

  static toResultDtoArray(feeds: Feed[]) {
    return feeds.map((feed) => this.toResultDto(feed));
  }
}

export class SearchFeedResponseDto {
  @ApiProperty({
    example: 1,
    description: '전체 게시글 개수',
  })
  totalCount: number;

  @ApiProperty({
    example: [
      {
        id: 32,
        blogName: 'example blog name',
        title: 'example title',
        likes: 0,
        path: 'https://example/feed',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ],
    description: '검색 결과 게시글',
  })
  result: SearchFeedResult[];

  @ApiProperty({
    example: 10,
    description: '총 페이지 수',
  })
  totalPages: number;

  @ApiProperty({
    example: 1,
    description: '한 페이지 최대 게시글 개수',
  })
  limit: number;

  private constructor(partial: Partial<SearchFeedResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(
    totalCount: number,
    feeds: SearchFeedResult[],
    totalPages: number,
    limit: number,
  ) {
    return new SearchFeedResponseDto({
      totalCount,
      result: feeds,
      totalPages,
      limit,
    });
  }
}
