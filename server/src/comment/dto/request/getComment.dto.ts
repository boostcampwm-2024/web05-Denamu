import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class GetCommentRequestDto {
  @ApiProperty({
    example: 1,
    description: '게시글 ID를 입력해주세요',
  })
  @IsInt({
    message: '숫자로 입력해주세요.',
  })
  @Type(() => Number)
  @Min(1, { message: '댓글 ID는 1 이상이어야 합니다.' })
  feedId: number;

  constructor(partial: Partial<GetCommentRequestDto>) {
    Object.assign(this, partial);
  }
}
