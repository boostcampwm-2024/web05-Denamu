import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmDeleteAccountDto {
  @ApiProperty({
    example: 'd2ba0d98-95ce-4905-87fc-384965ffe7c9',
    description: '회원탈퇴 인증 토큰을 입력해주세요.',
  })
  @IsNotEmpty({
    message: '인증 토큰을 입력해주세요.',
  })
  @IsString({
    message: '문자열로 입력해주세요.',
  })
  token: string;

  constructor(partial: Partial<ConfirmDeleteAccountDto>) {
    Object.assign(this, partial);
  }
}
