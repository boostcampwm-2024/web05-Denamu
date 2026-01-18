import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, Matches } from 'class-validator';

export class ResetPasswordRequestDto {
  @ApiProperty({
    example: 'd2ba0d98-95ce-4905-87fc-384965ffe7c9',
    description: '인증 코드를 입력해주세요.',
  })
  @IsNotEmpty({
    message: '인증 코드를 입력해주세요.',
  })
  uuid: string;

  @ApiProperty({
    example: 'example1234!',
    description: '비밀번호를 입력해주세요.',
  })
  @IsNotEmpty({
    message: '비밀번호가 없습니다.',
  })
  @Matches(
    /^(?=.{8,32}$)(?:(?=.*[a-z])(?=.*[A-Z])|(?=.*[a-z])(?=.*\d)|(?=.*[a-z])(?=.*[^A-Za-z0-9])|(?=.*[A-Z])(?=.*\d)|(?=.*[A-Z])(?=.*[^A-Za-z0-9])|(?=.*\d)(?=.*[^A-Za-z0-9])).*$/,
    {
      message:
        '비밀번호는 8~32자이며, 영문(대문자/소문자), 숫자, 특수문자 중 2종류 이상을 포함해야 합니다.',
    },
  )
  password: string;

  constructor(partial: Partial<ResetPasswordRequestDto>) {
    Object.assign(this, partial);
  }
}
