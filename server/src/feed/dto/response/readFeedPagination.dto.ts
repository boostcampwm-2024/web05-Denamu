import { ApiProperty } from '@nestjs/swagger';

import { FeedView } from '@feed/entity/feed.entity';

export class FeedResult {
  @ApiProperty({ example: 1, description: '게시글 ID' })
  id: number;

  @ApiProperty({ example: 'example author', description: '작성자' })
  author: string;

  @ApiProperty({ example: 'example platform', description: '블로그 플랫폼' })
  blogPlatform: string;

  @ApiProperty({ example: 'example title', description: '게시글 제목' })
  title: string;

  @ApiProperty({ example: 'https://example.com/feed', description: '게시글 URL' })
  path: string;

  @ApiProperty({ example: '2025-01-01T01:00:00.000Z', description: '게시글 작성 일자' })
  createdAt: Date;

  @ApiProperty({ example: 'https://example.com/thumbnail', description: '썸네일 URL' })
  thumbnail: string;

  @ApiProperty({ example: 0, description: '조회수' })
  viewCount: number;

  @ApiProperty({ example: false, description: '새 게시글 여부' })
  isNew: boolean;

  @ApiProperty({ example: ['tag1', 'tag2'], description: '태그 목록' })
  tag: string[];

  @ApiProperty({ example: 0, description: '좋아요 수' })
  likes: number;

  @ApiProperty({ example: 0, description: '댓글 수' })
  comments: number;

  @ApiProperty({
    example: 'https://example.com/profile.png',
    description: 'RSS 채널 프로필 이미지 URL',
    nullable: true,
  })
  blogImage: string | null;

  private constructor(partial: Partial<FeedResult>) {
    Object.assign(this, partial);
  }

  static toResultDto(feed: FeedPaginationResult) {
    return new FeedResult({
      id: feed.feedId,
      author: feed.blogName,
      blogPlatform: feed.blogPlatform,
      title: feed.title,
      path: feed.path,
      createdAt: feed.createdAt,
      thumbnail: feed.thumbnail,
      viewCount: feed.viewCount,
      isNew: feed.isNew,
      tag: feed.tag ? feed.tag : [],
      likes: feed.likeCount,
      comments: feed.commentCount,
      blogImage: feed.blogImage ?? null,
    });
  }

  public static toResultDtoArray(feedList: FeedPaginationResult[]) {
    return feedList.map((feed) => this.toResultDto(feed));
  }
}

export class ReadFeedPaginationResponseDto {
  @ApiProperty({ type: [FeedResult], description: '페이지네이션 결과 피드' })
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

  @ApiProperty({
    example: 'https://example.com/profile.png',
    description: 'RSS 채널 프로필 이미지 URL',
    nullable: true,
  })
  blogImage: string | null;

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
      blogImage: feed.blogImage ?? null,
    });
  }

  public static toResponseDtoArray(feedList: FeedView[]) {
    return feedList.map((feed) => this.toResponseDto(feed));
  }
}
