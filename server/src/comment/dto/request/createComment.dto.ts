import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentRequestDto {
  @ApiProperty({
    example: '댓글 내용',
    description: '댓글 내용을 입력해주세요.',
  })
  @IsString({
    message: '문자열을 입력해주세요',
  })
  @IsNotEmpty({ message: '댓글 내용을 입력하세요.' })
  comment: string;

  constructor(partial: Partial<CreateCommentRequestDto>) {
    Object.assign(this, partial);
  }
}
