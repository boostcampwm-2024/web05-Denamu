import { ApiProperty } from '@nestjs/swagger';

import { FeedView } from '@feed/entity/feed.entity';

export class GetFeedDetailResponseDto {
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

  @ApiProperty({
    example: false,
    description: '요청자가 해당 게시글의 RSS 소유자인지 여부',
  })
  isOwner: boolean;

  @ApiProperty({
    example: 1,
    description: '게시글이 속한 RSS(rss_accept) ID. 구독 버튼의 대상',
    nullable: true,
  })
  blogId: number | null;

  @ApiProperty({
    example: '조민석',
    description: 'RSS 블로그에 등록된 신청자(소유자) 이름',
    nullable: true,
  })
  ownerName: string | null;

  @ApiProperty({
    example: true,
    description: '해당 RSS의 소유자가 인증되었는지 여부',
  })
  isOwnerCertified: boolean;

  @ApiProperty({
    example: false,
    description: '요청자가 해당 RSS를 구독 중인지 여부',
  })
  isSubscribed: boolean;

  @ApiProperty({
    example: false,
    description: '요청자가 해당 게시글의 RSS를 차단했는지 여부 (비로그인 시 false)',
  })
  isBlocked: boolean;

  constructor(partial: Partial<GetFeedDetailResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(
    feed: FeedView,
    isOwner = false,
    blogMeta: { id: number; userName: string; userId: number | null } | null = null,
    isSubscribed = false,
    isBlocked = false,
  ) {
    return new GetFeedDetailResponseDto({
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
      isOwner,
      blogId: blogMeta?.id ?? null,
      ownerName: blogMeta?.userName ?? null,
      isOwnerCertified: blogMeta?.userId != null,
      isSubscribed,
      isBlocked,
    });
  }
}
