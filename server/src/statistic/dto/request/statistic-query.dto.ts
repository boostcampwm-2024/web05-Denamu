import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class StatisticRequestDto {
  @ApiProperty({
    description: '최대로 가져올 데이터 개수를 입력하세요.',
  })
  @IsOptional()
  @Min(1, { message: 'limit 값은 1 이상이어야 합니다.' })
  @IsInt({ message: '정수로 입력해주세요.' })
  @Type(() => Number)
  limit?: number = 10;

  constructor(partial: Partial<StatisticRequestDto>) {
    Object.assign(this, partial);
  }
}
