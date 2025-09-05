import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAdminRequestDto {
  @ApiProperty({
    example: 'test',
    description: '관리자 로그인 아이디를 입력해주세요.',
  })
  @IsNotEmpty({
    message: '아이디가 없습니다.',
  })
  @IsString({
    message: '문자열을 입력해주세요',
  })
  loginId: string;

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
