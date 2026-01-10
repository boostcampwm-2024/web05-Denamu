import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordRequestDto {
  @ApiProperty({
    example: 'example@example.com',
    description: '이메일을 입력해주세요.',
  })
  @IsEmail(
    {},
    {
      message: '이메일 주소 형식에 맞춰서 작성해주세요.',
    },
  )
  @IsNotEmpty({
    message: '이메일이 없습니다.',
  })
  email: string;

  constructor(partial: Partial<ForgotPasswordRequestDto>) {
    Object.assign(this, partial);
  }
}
