import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class RemoveCommentRequestDto {
  @ApiProperty({
    example: '1',
    description: '댓글 번호를 입력해주세요.',
  })
  @IsInt({
    message: '숫자로 입력해주세요.',
  })
  commentId: number;
}
