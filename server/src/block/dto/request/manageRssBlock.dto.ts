import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ManageRssBlockRequestDto {
  @ApiProperty({
    example: 1,
    description: '차단 또는 차단 해제할 RSS ID 입력',
  })
  @IsInt({
    message: '정수를 입력해주세요.',
  })
  @Min(1, { message: 'RSS ID는 1 이상이어야 합니다.' })
  @Type(() => Number)
  rssId: number;

  constructor(partial: Partial<ManageRssBlockRequestDto>) {
    Object.assign(this, partial);
  }
}
