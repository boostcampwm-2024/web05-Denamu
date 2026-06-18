import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class GetUserLikesParamRequestDto {
  @ApiProperty({
    example: 1,
    description: '좋아요를 조회할 사용자 ID',
  })
  @IsInt({
    message: '숫자로 입력해주세요.',
  })
  @Min(1, { message: '사용자 ID는 1 이상이어야 합니다.' })
  @Type(() => Number)
  userId: number;

  constructor(partial: Partial<GetUserLikesParamRequestDto>) {
    Object.assign(this, partial);
  }
}
