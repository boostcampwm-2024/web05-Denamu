import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class GetQnaRequestDto {
  @ApiProperty({ example: 1, description: '문의 ID' })
  @IsInt({ message: '정수를 입력해주세요.' })
  @Min(1, { message: 'id 값은 1 이상이어야 합니다.' })
  @Type(() => Number)
  id: number;

  constructor(partial: Partial<GetQnaRequestDto>) {
    Object.assign(this, partial);
  }
}
