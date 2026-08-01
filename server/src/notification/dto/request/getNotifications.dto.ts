import { ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class GetNotificationsRequestDto {
  @ApiPropertyOptional({
    example: 20,
    description: '받아올 최대 알림 개수',
    required: false,
  })
  @IsOptional()
  @Min(1, { message: 'limit 값은 1 이상이어야 합니다.' })
  @IsInt({
    message: '정수를 입력해주세요.',
  })
  @Type(() => Number)
  limit?: number = 20;

  constructor(partial: Partial<GetNotificationsRequestDto>) {
    Object.assign(this, partial);
  }
}
