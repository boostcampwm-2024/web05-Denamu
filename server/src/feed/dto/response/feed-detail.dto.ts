import { ApiProperty } from '@nestjs/swagger';
import { FeedView } from '../../entity/feed.entity';

export class FeedDetailResponseDto {
  @ApiProperty({
    example: 1,
    description: '피드 ID',
  })
  id: number;

  @ApiProperty({
    example: 'example author',
    description: '게시글 작성자 이름',
  })
  author: string;

  @ApiProperty({
    example: 'example platform',
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
    description: '게시글 작성 일자',
  })
  createdAt: Date;

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
    example: 'example',
    description: '요약 내용',
  })
  summary: string;

  @ApiProperty({
    example: 1,
    description: '좋아요 수',
  })
  likes: number;

  @ApiProperty({
    example: 1,
    description: '댓글 수',
  })
  comments: number;

  @ApiProperty({
    example: ['example1', 'example2', 'example3'],
    description: '태그 배열',
  })
  tag: string[];

  private constructor(partial: Partial<FeedDetailResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(feed: FeedView) {
    return new FeedDetailResponseDto({
      id: feed.feedId,
      author: feed.blogName,
      blogPlatform: feed.blogPlatform,
      title: feed.title,
      path: feed.path,
      createdAt: feed.createdAt,
      thumbnail: feed.thumbnail,
      viewCount: feed.viewCount,
      summary: feed.summary,
      likes: feed.likeCount,
      comments: feed.commentCount,
      tag: feed.tag ? feed.tag : [],
    });
  }
}
