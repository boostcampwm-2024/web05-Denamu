import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CheckNameDuplicationRequestDto {
  @ApiProperty({
    example: '홍길동',
    description: '중복 확인할 관리자 이름을 입력해주세요.',
  })
  @IsString({ message: '문자열을 입력해주세요.' })
  @IsNotEmpty({ message: '이름이 없습니다.' })
  @Type(() => String)
  name: string;

  constructor(partial: Partial<CheckNameDuplicationRequestDto>) {
    Object.assign(this, partial);
  }
}
