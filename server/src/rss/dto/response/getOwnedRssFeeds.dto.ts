import { ApiProperty } from '@nestjs/swagger';

import { Feed } from '@feed/entity/feed.entity';

export class OwnedRssFeedResult {
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
    description: '게시글 원본 URL',
  })
  path: string;

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
    example: true,
    description: '공개 여부 (true: 공개, false: 비공개)',
  })
  isPublic: boolean;

  private constructor(partial: Partial<OwnedRssFeedResult>) {
    Object.assign(this, partial);
  }

  static toResultDto(feed: Feed) {
    return new OwnedRssFeedResult({
      id: feed.id,
      title: feed.title,
      path: feed.path,
      createdAt: feed.createdAt,
      commentCount: feed.commentCount,
      isPublic: feed.isPublic,
    });
  }

  static toResultDtoArray(feeds: Feed[]) {
    return feeds.map((feed) => this.toResultDto(feed));
  }
}

export class GetOwnedRssFeedsResponseDto {
  @ApiProperty({ type: [OwnedRssFeedResult], description: 'RSS의 게시글 목록' })
  result: OwnedRssFeedResult[];

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

  constructor(partial: Partial<GetOwnedRssFeedsResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(feeds: Feed[], lastId: number, hasMore: boolean) {
    return new GetOwnedRssFeedsResponseDto({
      result: OwnedRssFeedResult.toResultDtoArray(feeds),
      lastId,
      hasMore,
    });
  }
}
