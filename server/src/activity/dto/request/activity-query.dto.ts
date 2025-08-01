import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min, Max } from 'class-validator';

export class ActivityQueryRequestDto {
  @ApiProperty({
    example: 2024,
    description: '조회할 연도',
  })
  @IsInt({
    message: '정수를 입력해주세요.',
  })
  @Min(2000, { message: '연도는 2000년 이상이어야 합니다.' })
  @Max(3000, { message: '연도는 3000년 이하여야 합니다.' })
  @Type(() => Number)
  year: number;

  constructor(partial: Partial<ActivityQueryRequestDto>) {
    Object.assign(this, partial);
  }
}
