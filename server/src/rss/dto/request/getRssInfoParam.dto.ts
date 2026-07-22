import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class GetRssInfoParamRequestDto {
  @ApiProperty({
    example: 1,
    description: '조회할 RSS(rss_accept) ID',
  })
  @IsInt({
    message: '정수를 입력해주세요.',
  })
  @Min(1, { message: 'RSS ID는 1 이상이어야 합니다.' })
  @Type(() => Number)
  rssId: number;

  constructor(partial: Partial<GetRssInfoParamRequestDto>) {
    Object.assign(this, partial);
  }
}
