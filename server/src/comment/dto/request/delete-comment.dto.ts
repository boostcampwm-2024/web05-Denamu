import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class DeleteCommentRequestDto {
  @ApiProperty({
    example: '1',
    description: '댓글 번호를 입력해주세요.',
  })
  @IsInt({
    message: '숫자로 입력해주세요.',
  })
  @Type(() => Number)
  commentId: number;

  constructor(partial: Partial<DeleteCommentRequestDto>) {
    Object.assign(this, partial);
  }
}
