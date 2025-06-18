import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class GetCommentRequestDto {
  @ApiProperty({
    example: '게시글 ID',
    description: '게시글 ID를 입력해주세요',
  })
  @IsInt({
    message: '숫자로 입력해주세요.',
  })
  @Type(() => Number)
  feedId: number;

  constructor(partial: Partial<GetCommentRequestDto>) {
    Object.assign(this, partial);
  }
}
