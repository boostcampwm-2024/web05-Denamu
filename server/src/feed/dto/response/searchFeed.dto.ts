import { ApiProperty } from '@nestjs/swagger';

import { Feed } from '@feed/entity/feed.entity';

export class SearchFeedResult {
  @ApiProperty({ example: 1, description: '게시글 ID' })
  id: number;

  @ApiProperty({ example: 'example blog name', description: '블로그 이름' })
  blogName: string;

  @ApiProperty({ example: 'example title', description: '게시글 제목' })
  title: string;

  @ApiProperty({ example: 'https://example.com/feed', description: '게시글 URL' })
  path: string;

  @ApiProperty({ example: '2025-01-01T01:00:00.000Z', description: '게시글 작성 일자' })
  createdAt: Date;

  @ApiProperty({ example: 'example author', description: '작성자' })
  author: string;

  @ApiProperty({ example: 'example platform', description: '블로그 플랫폼' })
  blogPlatform: string;

  @ApiProperty({ example: 'https://example.com/thumbnail', description: '썸네일 URL' })
  thumbnail: string;

  @ApiProperty({ example: 0, description: '조회수' })
  viewCount: number;

  @ApiProperty({ example: [], description: '태그 목록' })
  tag: string[];

  @ApiProperty({ example: 0, description: '좋아요 수' })
  likes: number;

  @ApiProperty({ example: 0, description: '댓글 수' })
  comments: number;

  private constructor(partial: Partial<SearchFeedResult>) {
    Object.assign(this, partial);
  }

  static toResultDto(feed: Feed) {
    return new SearchFeedResult({
      id: feed.id,
      blogName: feed.blog.name,
      title: feed.title,
      path: feed.path,
      createdAt: feed.createdAt,
      author: feed.blog.name,
      blogPlatform: feed.blog.blogPlatform,
      thumbnail: feed.thumbnail,
      viewCount: feed.viewCount,
      tag: [],
      likes: feed.likeCount,
      comments: feed.commentCount,
    });
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

  @ApiProperty({ type: [SearchFeedResult], description: '검색 결과 게시글' })
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

  constructor(partial: Partial<SearchFeedResponseDto>) {
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
