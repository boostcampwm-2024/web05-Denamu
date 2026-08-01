import { ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsInt, IsOptional, Matches, Min } from 'class-validator';

export class GetRssFeedsRequestDto {
  @ApiPropertyOptional({
    example: 1,
    description: '마지막으로 조회한 게시글 ID (커서)',
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
    description: '받아올 최대 게시글 개수',
    required: false,
  })
  @IsOptional()
  @Min(1, { message: 'limit 값은 1 이상이어야 합니다.' })
  @IsInt({
    message: '정수를 입력해주세요.',
  })
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: '2025-01-15',
    description: '해당 날짜(YYYY-MM-DD)에 발행된 게시글만 조회',
    required: false,
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date는 YYYY-MM-DD 형식이어야 합니다.',
  })
  date?: string;

  constructor(partial: Partial<GetRssFeedsRequestDto>) {
    Object.assign(this, partial);
  }
}
