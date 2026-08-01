import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class DeleteRssCertificationParamRequestDto {
  @ApiProperty({
    example: 1,
    description: '인증을 해제할 RSS(rss_accept) ID',
  })
  @IsInt({
    message: '정수를 입력해주세요.',
  })
  @Min(1, { message: 'RSS ID는 1 이상이어야 합니다.' })
  @Type(() => Number)
  id: number;

  constructor(partial: Partial<DeleteRssCertificationParamRequestDto>) {
    Object.assign(this, partial);
  }
}
