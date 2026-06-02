import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCommentRequestDto {
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
