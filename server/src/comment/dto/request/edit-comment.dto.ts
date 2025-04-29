import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class EditCommentRequestDto {
  @ApiProperty({
    example: '댓글 번호',
    description: '댓글 번호를 입력해주세요.',
  })
  @IsInt({
    message: '정수로 입력하세요.',
  })
  commentId: number;

  @ApiProperty({
    example: '수정할 내용',
    description: '수정할 내용을 입력해주세요.',
  })
  @IsString({
    message: '문자열을 입력하세요.',
  })
  newComment: string;
}
