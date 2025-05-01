import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class DeleteCommentRequestDto {
  @ApiProperty({
    example: '1',
    description: '댓글 번호를 입력해주세요.',
  })
  @IsInt({
    message: '숫자로 입력해주세요.',
  })
  @IsNotEmpty({ message: '댓글 아이디를 입력하세요.' })
  commentId: number;

  constructor(partial: Partial<DeleteCommentRequestDto>) {
    Object.assign(this, partial);
  }
}
