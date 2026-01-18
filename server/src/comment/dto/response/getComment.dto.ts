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
    profileImage: string;
  };

  private constructor(partial: Partial<GetCommentResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(comment: Comment) {
    return new GetCommentResponseDto({
      id: comment.id,
      comment: comment.comment,
      date: comment.date,
      user: {
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
