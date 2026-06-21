import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

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

  @ApiPropertyOptional({
    example: 1,
    description: '답글인 경우 부모 댓글 ID를 입력해주세요.',
  })
  @IsOptional()
  @IsInt({ message: '부모 댓글 ID는 숫자로 입력해주세요.' })
  @Min(1, { message: '부모 댓글 ID는 1 이상이어야 합니다.' })
  @Type(() => Number)
  parentId?: number;

  constructor(partial: Partial<CreateCommentRequestDto>) {
    Object.assign(this, partial);
  }
}
