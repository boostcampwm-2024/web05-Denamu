import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: '이메일 주소 형식에 맞춰서 작성해주세요.' })
  @IsNotEmpty({ message: '이메일을 입력하세요.' })
  email: string;

  @IsNotEmpty({ message: '비밀번호를 입력하세요.' })
  password: string;
}
