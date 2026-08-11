import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ReportIdParamRequestDto {
  @ApiProperty({
    example: 1,
    description: '신고 ID',
  })
  @IsInt({
    message: '정수를 입력해주세요.',
  })
  @Min(1, { message: '신고 ID는 1 이상이어야 합니다.' })
  @Type(() => Number)
  id: number;

  constructor(partial: Partial<ReportIdParamRequestDto>) {
    Object.assign(this, partial);
  }
}
