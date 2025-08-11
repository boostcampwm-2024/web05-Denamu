import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class UpdateCommentRequestDto {
  @ApiProperty({
    example: 1,
    description: '댓글 번호를 입력해주세요.',
  })
  @IsInt({
    message: '정수로 입력하세요.',
  })
  @Type(() => Number)
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
