import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginAdminRequestDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: '관리자 이메일을 입력해주세요.',
  })
  @IsEmail(
    {},
    {
      message: '이메일 주소 형식에 맞춰서 작성해주세요.',
    },
  )
  email: string;

  @ApiProperty({
    example: 'test1234!',
    description: '패스워드를 입력해주세요.',
  })
  @IsNotEmpty({
    message: '패스워드가 없습니다.',
  })
  @IsString({
    message: '문자열을 입력해주세요',
  })
  password: string;

  constructor(partial: Partial<LoginAdminRequestDto>) {
    Object.assign(this, partial);
  }
}
