import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CheckUserNameDuplicationRequestDto {
  @ApiProperty({
    example: '홍길동',
    description: '중복 확인할 사용자 이름을 입력해주세요.',
  })
  @IsString({
    message: '사용자 이름은 문자열이어야 합니다.',
  })
  @IsNotEmpty({
    message: '사용자 이름이 없습니다.',
  })
  @MaxLength(60, {
    message: '사용자 이름은 60자 이하여야 합니다.',
  })
  @Type(() => String)
  userName: string;

  constructor(partial: Partial<CheckUserNameDuplicationRequestDto>) {
    Object.assign(this, partial);
  }
}
