import { IsEmail, IsNotEmpty } from 'class-validator';
import { User } from '../../entity/user.entity';

export class SignupDto {
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

  @IsNotEmpty({
    message: '비밀번호가 없습니다.',
  })
  password: string;

  @IsNotEmpty({
    message: '사용자 이름이 없습니다.',
  })
  userName: string;

  toEntity() {
    const user = new User();
    user.email = this.email;
    user.password = this.password;
    user.userName = this.userName;

    return user;
  }
}
