import { ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class GetUserCommentsRequestDto {
  @ApiPropertyOptional({
    example: 1,
    description: '마지막으로 조회한 댓글 ID (커서)',
    required: false,
  })
  @IsOptional()
  @Min(1, { message: 'lastId 값은 1 이상이어야 합니다.' })
  @IsInt({
    message: '정수를 입력해주세요.',
  })
  @Type(() => Number)
  lastId?: number;

  @ApiPropertyOptional({
    example: 10,
    description: '받아올 최대 댓글 개수',
    required: false,
  })
  @IsOptional()
  @Min(1, { message: 'limit 값은 1 이상이어야 합니다.' })
  @IsInt({
    message: '정수를 입력해주세요.',
  })
  @Type(() => Number)
  limit?: number = 10;

  constructor(partial: Partial<GetUserCommentsRequestDto>) {
    Object.assign(this, partial);
  }
}
