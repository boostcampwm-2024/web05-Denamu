import { IsEmail, IsNotEmpty } from 'class-validator';
import { User } from '../../entity/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'test123@test.com',
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

  @ApiProperty({
    example: 'test1234!',
    description: '비밀번호를 입력해주세요.',
  })
  @IsNotEmpty({
    message: '비밀번호가 없습니다.',
  })
  password: string;

  @ApiProperty({
    example: '홍길동',
    description: '사용자 이름을 입력해주세요.',
  })
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
