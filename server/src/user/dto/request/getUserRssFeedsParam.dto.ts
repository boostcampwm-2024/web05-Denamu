import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class GetUserRssFeedsParamRequestDto {
  @ApiProperty({
    example: 1,
    description: 'RSS 소유자 사용자 ID',
  })
  @IsInt({
    message: '숫자로 입력해주세요.',
  })
  @Min(1, { message: '사용자 ID는 1 이상이어야 합니다.' })
  @Type(() => Number)
  id: number;

  @ApiProperty({
    example: 1,
    description: '게시글을 조회할 RSS(rss_accept) ID',
  })
  @IsInt({
    message: '숫자로 입력해주세요.',
  })
  @Min(1, { message: 'RSS ID는 1 이상이어야 합니다.' })
  @Type(() => Number)
  rssId: number;

  constructor(partial: Partial<GetUserRssFeedsParamRequestDto>) {
    Object.assign(this, partial);
  }
}
