import { ApiProperty } from '@nestjs/swagger';

import { Comment } from '@comment/entity/comment.entity';

export class UserCommentResult {
  @ApiProperty({
    example: 1,
    description: '댓글 ID',
  })
  id: number;

  @ApiProperty({
    example: 'example content',
    description: '댓글 내용',
  })
  comment: string;

  @ApiProperty({
    example: '2025-01-01T00:00:00.000Z',
    description: '댓글 작성 날짜',
  })
  date: Date;

  @ApiProperty({
    example: {
      id: 1,
      title: 'example title',
      path: 'https://example.com/feed',
    },
    description: '댓글이 작성된 게시글 정보 (path: 게시글 URL)',
  })
  feed: {
    id: number;
    title: string;
    path: string;
  };

  private constructor(partial: Partial<UserCommentResult>) {
    Object.assign(this, partial);
  }

  static toResultDto(comment: Comment) {
    return new UserCommentResult({
      id: comment.id,
      comment: comment.comment,
      date: comment.date,
      feed: {
        id: comment.feed.id,
        title: comment.feed.title,
        path: comment.feed.path,
      },
    });
  }

  static toResultDtoArray(comments: Comment[]) {
    return comments.map((comment) => this.toResultDto(comment));
  }
}

export class GetUserCommentsResponseDto {
  @ApiProperty({ type: [UserCommentResult], description: '유저가 작성한 댓글 목록' })
  result: UserCommentResult[];

  @ApiProperty({
    example: 1,
    description: '마지막으로 조회한 댓글 ID (다음 요청의 커서)',
  })
  lastId: number;

  @ApiProperty({
    example: true,
    description: '다음 페이지 존재 여부',
  })
  hasMore: boolean;

  constructor(partial: Partial<GetUserCommentsResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(
    comments: Comment[],
    lastId: number,
    hasMore: boolean,
  ) {
    return new GetUserCommentsResponseDto({
      result: UserCommentResult.toResultDtoArray(comments),
      lastId,
      hasMore,
    });
  }
}
