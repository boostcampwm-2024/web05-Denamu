import { ApiProperty } from '@nestjs/swagger';

import { IsString, MinLength } from 'class-validator';

export class VerifyQnaRequestDto {
  @ApiProperty({ description: '문의 확인용 비밀번호', example: 'qna1234' })
  @IsString({ message: '문자열로 입력해주세요.' })
  @MinLength(4, { message: '비밀번호는 4자 이상으로 입력해주세요.' })
  password: string;

  constructor(partial: Partial<VerifyQnaRequestDto>) {
    Object.assign(this, partial);
  }
}
