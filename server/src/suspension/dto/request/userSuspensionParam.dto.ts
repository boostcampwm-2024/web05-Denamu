import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class UserSuspensionParamRequestDto {
  @ApiProperty({ example: 1, description: '정지 대상 유저 ID' })
  @IsInt({ message: '숫자로 입력해주세요.' })
  @Min(1, { message: '유저 ID는 1 이상이어야 합니다.' })
  @Type(() => Number)
  userId: number;

  constructor(partial: Partial<UserSuspensionParamRequestDto>) {
    Object.assign(this, partial);
  }
}
