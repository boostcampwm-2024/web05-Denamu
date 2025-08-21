import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class UpdateCommentRequestDto {
  @ApiProperty({
    example: 1,
    description: '댓글 번호를 입력해주세요.',
  })
  @IsInt({
    message: '정수로 입력하세요.',
  })
  @Min(1, { message: '댓글 ID는 1 이상이어야 합니다.' })
  commentId: number;

  @ApiProperty({
    example: '수정할 내용',
    description: '수정할 내용을 입력해주세요.',
  })
  @IsString({
    message: '문자열을 입력하세요.',
  })
  @IsNotEmpty({ message: '댓글 내용을 입력하세요.' })
  newComment: string;

  constructor(partial: Partial<UpdateCommentRequestDto>) {
    Object.assign(this, partial);
  }
}
