import { ApiProperty } from '@nestjs/swagger';

import { Feed } from '@feed/entity/feed.entity';

export class SubscriptionFeedResult {
  @ApiProperty({ example: 1, description: '게시글 ID' })
  id: number;

  @ApiProperty({ example: 'example author', description: '작성자(블로그명)' })
  author: string;

  @ApiProperty({
    example: { platform: 'example platform', image: 'https://example.com/profile.png' },
    description: 'RSS 채널 정보',
  })
  blog: {
    platform: string;
    image: string | null;
  };

  @ApiProperty({ example: 'example title', description: '게시글 제목' })
  title: string;

  @ApiProperty({ example: 'https://example.com/feed', description: '게시글 URL' })
  path: string;

  @ApiProperty({
    example: '2025-01-01T01:00:00.000Z',
    description: '게시글 작성 일자',
  })
  createdAt: Date;

  @ApiProperty({
    example: 'https://example.com/thumbnail',
    description: '썸네일 URL',
  })
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

  private constructor(partial: Partial<SubscriptionFeedResult>) {
    Object.assign(this, partial);
  }

  static toResultDto(feed: Feed) {
    return new SubscriptionFeedResult({
      id: feed.id,
      author: feed.blog.name,
      blog: {
        platform: feed.blog.blogPlatform,
        image: feed.blog.blogImage ?? null,
      },
      title: feed.title,
      path: feed.path,
      createdAt: feed.createdAt,
      thumbnail: feed.thumbnail,
      viewCount: feed.viewCount,
      isNew: false,
      tag: feed.tags ? feed.tags.map((tag) => tag.name) : [],
      likes: feed.likeCount,
      comments: feed.commentCount,
    });
  }

  static toResultDtoArray(feeds: Feed[]) {
    return feeds.map((feed) => this.toResultDto(feed));
  }
}

export class ReadSubscriptionFeedResponseDto {
  @ApiProperty({ type: [SubscriptionFeedResult], description: '구독 피드 목록' })
  result: SubscriptionFeedResult[];

  @ApiProperty({ example: 1, description: '마지막 게시글 ID (커서)' })
  lastId: number;

  @ApiProperty({ example: true, description: '다음 페이지 존재 여부' })
  hasMore: boolean;

  constructor(partial: Partial<ReadSubscriptionFeedResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(feeds: Feed[], lastId: number, hasMore: boolean) {
    return new ReadSubscriptionFeedResponseDto({
      result: SubscriptionFeedResult.toResultDtoArray(feeds),
      lastId,
      hasMore,
    });
  }
}
