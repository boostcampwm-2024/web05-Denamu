import { ApiProperty } from '@nestjs/swagger';

import { Comment } from '@comment/entity/comment.entity';

export class GetCommentResponseDto {
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
    example: null,
    description: '답글인 경우 부모 댓글 ID, 최상위 댓글은 null',
    nullable: true,
  })
  parentId: number | null;

  @ApiProperty({
    example: false,
    description: '삭제된 댓글 여부(답글이 달린 댓글은 삭제되어도 placeholder로 노출)',
  })
  isDeleted: boolean;

  @ApiProperty({
    example: '2025-01-01T00:00:00.000Z',
    description: '댓글 작성 날짜',
  })
  date: Date;

  @ApiProperty({
    example: {
      id: 1,
      userName: 'example',
      profileImage: 'https://example.com',
    },
    description: '댓글 작성자 정보',
  })
  user: {
    id: number;
    userName: string;
    profileImage: string | null;
  };

  constructor(partial: Partial<GetCommentResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(comment: Comment) {
    return new GetCommentResponseDto({
      id: comment.id,
      parentId: comment.parentId ?? null,
      isDeleted: comment.isDeleted,
      comment: comment.isAdminDeleted
        ? '관리자에 의해 제거된 댓글입니다.'
        : comment.isDeleted
          ? '삭제된 댓글입니다.'
          : comment.comment,
      date: comment.date,
      user: comment.isDeleted
        ? { id: 0, userName: '(알 수 없음)', profileImage: null }
        : {
            id: comment.user.id,
            userName: comment.user.userName,
            profileImage: comment.user.profileImage,
          },
    });
  }

  static toResponseDtoArray(comments: Comment[]) {
    return comments.map((comment) => this.toResponseDto(comment));
  }
}
