import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class SetFeedVisibilityParamRequestDto {
  @ApiProperty({
    example: 1,
    description: '게시글이 속한 RSS(rss_accept) ID',
  })
  @IsInt({
    message: '정수를 입력해주세요.',
  })
  @Min(1, { message: 'RSS ID는 1 이상이어야 합니다.' })
  @Type(() => Number)
  id: number;

  @ApiProperty({
    example: 1,
    description: '공개/비공개를 변경할 게시글 ID',
  })
  @IsInt({
    message: '정수를 입력해주세요.',
  })
  @Min(1, { message: '게시글 ID는 1 이상이어야 합니다.' })
  @Type(() => Number)
  feedId: number;

  constructor(partial: Partial<SetFeedVisibilityParamRequestDto>) {
    Object.assign(this, partial);
  }
}
