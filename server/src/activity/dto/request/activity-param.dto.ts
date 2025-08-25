import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ActivityParamRequestDto {
  @ApiProperty({
    example: 1,
    description: '조회할 사용자 ID',
  })
  @IsInt({
    message: '정수를 입력해주세요.',
  })
  @Min(1, { message: '사용자 ID는 1 이상이어야 합니다.' })
  @Type(() => Number)
  userId: number;

  constructor(partial: Partial<ActivityParamRequestDto>) {
    Object.assign(this, partial);
  }
}
