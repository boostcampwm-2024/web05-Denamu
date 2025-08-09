import { ApiProperty } from '@nestjs/swagger';

export class FeedRecentResponseDto {
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
    example: 'example',
    description: '블로그 플랫폼',
  })
  blogPlatform: string;

  @ApiProperty({
    example: 'example',
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
    description: '게시글 작성 일자',
  })
  createdAt: string;

  @ApiProperty({
    example: 'https://example.com/thumbnail',
    description: '썸네일 URL',
  })
  thumbnail: string;

  @ApiProperty({
    example: 1,
    description: '조회수',
  })
  viewCount: number;

  @ApiProperty({
    example: true,
    description: '새 게시글 확인',
  })
  isNew: boolean;

  @ApiProperty({
    example: 1,
    description: '좋아요 수',
  })
  likes: number;

  @ApiProperty({
    example: ['example1', 'example2', 'example3'],
    description: '태그 목록',
  })
  tag: string[] | string;

  constructor(partial: Partial<FeedRecentResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(feed: FeedRecentRedis) {
    return new FeedRecentResponseDto({
      id: feed.id,
      author: feed.blogName,
      blogPlatform: feed.blogPlatform,
      title: feed.title,
      path: feed.path,
      createdAt: feed.createdAt,
      thumbnail: feed.thumbnail,
      viewCount: feed.viewCount,
      isNew: feed.isNew,
      likes: feed.likes,
      tag: feed.tagList,
    });
  }

  static toResponseDtoArray(feeds: FeedRecentRedis[]) {
    return feeds.map(this.toResponseDto);
  }
}

export type FeedRecentRedis = {
  id: number;
  blogPlatform: string;
  createdAt: string;
  viewCount: number;
  blogName: string;
  thumbnail: string;
  path: string;
  title: string;
  isNew?: boolean;
  tagList: string[] | string;
  likes: number;
};
