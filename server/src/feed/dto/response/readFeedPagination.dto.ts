import { ApiProperty } from '@nestjs/swagger';
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
    private likes: number,
    private comments: number,
  ) {}

  static toResultDto(feed: FeedPaginationResult) {
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
      feed.tag ? feed.tag : [],
      feed.likeCount,
      feed.commentCount,
    );
  }

  public static toResultDtoArray(feedList: FeedPaginationResult[]) {
    return feedList.map(this.toResultDto);
  }
}

export class ReadFeedPaginationResponseDto {
  @ApiProperty({
    example: [
      {
        id: 1,
        author: 'example author',
        blogPlatform: 'example platform',
        title: 'example title',
        path: 'https://example.com/feed',
        createdAt: '2025-01-01T01:00:00.000Z',
        thumbnail: 'https://example.com/thumbnail',
        viewCount: 0,
        isNew: false,
        tag: ['example1', 'example2'],
        likes: 0,
      },
    ],
    description: '페이지네이션 결과 피드',
  })
  result: FeedResult[];

  @ApiProperty({
    example: 1,
    description: '마지막 게시글 ID',
  })
  lastId: number;

  @ApiProperty({
    example: true,
    description: '다음에 더 페이지가 있는지 확인 값',
  })
  hasMore: boolean;

  constructor(partial: Partial<ReadFeedPaginationResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(
    feedPagination: FeedResult[],
    lastId: number,
    hasMore: boolean,
  ) {
    return new ReadFeedPaginationResponseDto({
      result: feedPagination,
      lastId,
      hasMore,
    });
  }
}

export type FeedPaginationResult = FeedView & { isNew: boolean };

export class FeedTrendResponseDto {
  @ApiProperty({
    example: 1,
    description: '게시글 ID',
  })
  id: number;

  @ApiProperty({
    example: 'example author',
    description: '작성자',
  })
  author: string;

  @ApiProperty({
    example: 'example blog platform',
    description: '블로그 플랫폼',
  })
  blogPlatform: string;

  @ApiProperty({
    example: 'example title',
    description: '게시글 제목',
  })
  title: string;

  @ApiProperty({
    example: 'https://example.com/feed',
    description: '게시글 URL',
  })
  path: string;

  @ApiProperty({
    example: '2025-01-01T01:00:00.000Z',
    description: '게시글 작성일자',
  })
  createdAt: Date;

  @ApiProperty({
    example: 'https://example.com/thumbnail',
    description: '게시글 썸네일',
  })
  thumbnail: string;

  @ApiProperty({
    example: 1,
    description: '게시글 조회수',
  })
  viewCount: number;

  @ApiProperty({
    example: 1,
    description: '게시글 좋아요 수',
  })
  likes: number;

  @ApiProperty({
    example: 1,
    description: '댓글 개수',
  })
  comments: number;

  @ApiProperty({
    example: ['example1', 'example2', 'example3'],
    description: '게시글 태그',
  })
  tag: string[];

  private constructor(partial: Partial<FeedTrendResponseDto>) {
    Object.assign(this, partial);
  }

  private static toResponseDto(feed: FeedView) {
    return new FeedTrendResponseDto({
      id: feed.feedId,
      author: feed.blogName,
      blogPlatform: feed.blogPlatform,
      title: feed.title,
      path: feed.path,
      createdAt: feed.createdAt,
      thumbnail: feed.thumbnail,
      viewCount: feed.viewCount,
      likes: feed.likeCount,
      comments: feed.commentCount,
      tag: feed.tag ? feed.tag : [],
    });
  }

  public static toResponseDtoArray(FeedList: FeedView[]) {
    return FeedList.map(this.toResponseDto);
  }
}
