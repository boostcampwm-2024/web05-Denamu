import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class CommentParamRequestDto {
  @ApiProperty({
    example: 1,
    description: '댓글 번호를 입력해주세요.',
  })
  @IsInt({ message: '숫자로 입력해주세요.' })
  @Min(1, { message: '댓글 ID는 1 이상이어야 합니다.' })
  @Type(() => Number)
  commentId: number;

  constructor(partial: Partial<CommentParamRequestDto>) {
    Object.assign(this, partial);
  }
}
