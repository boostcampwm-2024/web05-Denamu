import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserRequestDto {
  @ApiProperty({
    example: 'test@test.com',
    description: '이메일을 입력해주세요.',
  })
  @IsEmail({}, { message: '이메일 주소 형식에 맞춰서 작성해주세요.' })
  email: string;

  @ApiProperty({
    example: 'test1234!',
    description: '비밀번호를 입력해주세요.',
  })
  @IsString({ message: '비밀번호를 문자열로 입력해주세요.' })
  @IsNotEmpty({ message: '비밀번호를 입력하세요.' })
  password: string;

  constructor(partial: Partial<LoginUserRequestDto>) {
    Object.assign(this, partial);
  }
}
