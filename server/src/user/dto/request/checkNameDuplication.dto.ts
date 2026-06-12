import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CheckNameDuplicationRequestDto {
  @ApiProperty({
    example: '홍길동',
    description: '중복 확인할 닉네임을 입력해주세요.',
  })
  @IsString({ message: '문자열을 입력해주세요.' })
  @IsNotEmpty({ message: '닉네임이 없습니다.' })
  @Type(() => String)
  userName: string;

  constructor(partial: Partial<CheckNameDuplicationRequestDto>) {
    Object.assign(this, partial);
  }
}
