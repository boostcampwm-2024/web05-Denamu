import { ApiProperty } from '@nestjs/swagger';

import { Feed } from '@feed/entity/feed.entity';

export class RssFeedResult {
  @ApiProperty({
    example: 1,
    description: '게시글 ID',
  })
  id: number;

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
    example: 'https://example.com/thumbnail.png',
    description: '게시글 썸네일 URL',
  })
  thumbnail: string;

  @ApiProperty({
    example: '2025-01-01T00:00:00.000Z',
    description: '게시글 작성일',
  })
  createdAt: Date;

  @ApiProperty({
    example: 0,
    description: '게시글 댓글 수',
  })
  commentCount: number;

  @ApiProperty({
    example: 0,
    description: '게시글 좋아요 수',
  })
  likeCount: number;

  private constructor(partial: Partial<RssFeedResult>) {
    Object.assign(this, partial);
  }

  static toResultDto(feed: Feed) {
    return new RssFeedResult({
      id: feed.id,
      title: feed.title,
      path: feed.path,
      thumbnail: feed.thumbnail,
      createdAt: feed.createdAt,
      commentCount: feed.commentCount,
      likeCount: feed.likeCount,
    });
  }

  static toResultDtoArray(feeds: Feed[]) {
    return feeds.map((feed) => this.toResultDto(feed));
  }
}

export class GetRssFeedsResponseDto {
  @ApiProperty({ type: [RssFeedResult], description: 'RSS의 게시글 목록' })
  result: RssFeedResult[];

  @ApiProperty({
    example: 1,
    description: '마지막으로 조회한 게시글 ID (다음 요청의 커서)',
  })
  lastId: number;

  @ApiProperty({
    example: true,
    description: '다음 페이지 존재 여부',
  })
  hasMore: boolean;

  constructor(partial: Partial<GetRssFeedsResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(feeds: Feed[], lastId: number, hasMore: boolean) {
    return new GetRssFeedsResponseDto({
      result: RssFeedResult.toResultDtoArray(feeds),
      lastId,
      hasMore,
    });
  }
}
