import { ApiProperty } from '@nestjs/swagger';

import { Like } from '@like/entity/like.entity';

export class UserLikeResult {
  @ApiProperty({
    example: 1,
    description: '좋아요 ID',
  })
  id: number;

  @ApiProperty({
    example: '2025-01-01T00:00:00.000Z',
    description: '좋아요 누른 날짜',
  })
  likeDate: Date;

  @ApiProperty({
    example: {
      id: 1,
      title: 'example title',
      path: 'https://example.com/feed',
    },
    description: '좋아요를 누른 게시글 정보 (path: 게시글 URL)',
  })
  feed: {
    id: number;
    title: string;
    path: string;
  };

  private constructor(partial: Partial<UserLikeResult>) {
    Object.assign(this, partial);
  }

  static toResultDto(like: Like) {
    return new UserLikeResult({
      id: like.id,
      likeDate: like.likeDate,
      feed: {
        id: like.feed.id,
        title: like.feed.title,
        path: like.feed.path,
      },
    });
  }

  static toResultDtoArray(likes: Like[]) {
    return likes.map((like) => this.toResultDto(like));
  }
}

export class GetUserLikesResponseDto {
  @ApiProperty({ type: [UserLikeResult], description: '유저가 좋아요를 누른 목록' })
  result: UserLikeResult[];

  @ApiProperty({
    example: 1,
    description: '마지막으로 조회한 좋아요 ID (다음 요청의 커서)',
  })
  lastId: number;

  @ApiProperty({
    example: true,
    description: '다음 페이지 존재 여부',
  })
  hasMore: boolean;

  constructor(partial: Partial<GetUserLikesResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(likes: Like[], lastId: number, hasMore: boolean) {
    return new GetUserLikesResponseDto({
      result: UserLikeResult.toResultDtoArray(likes),
      lastId,
      hasMore,
    });
  }
}
