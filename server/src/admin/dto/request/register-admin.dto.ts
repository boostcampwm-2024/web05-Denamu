import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Admin } from '../../entity/admin.entity';

const PASSWORD_REG = /^(?=.*[!@#$%^&*()_+])[A-Za-z0-9!@#$%^&*()_+]+$/;

export class RegisterAdminRequestDto {
  @ApiProperty({
    example: 'test',
    description: '관리자 로그인 아이디를 입력해주세요.',
  })
  @IsString({
    message: '문자열을 입력해주세요',
  })
  @Length(6, 255, {
    message: '아이디의 길이는 6자 이상, 255자 이하로 작성해주세요.',
  })
  loginId: string;

  @ApiProperty({
    example: 'test1234!',
    description:
      '패스워드를 입력해주세요. (최소 6자, 영문/숫자/특수문자로 이루어질 수 있으며 특수문자 1개 이상 포함)',
  })
  @IsString({
    message: '문자열을 입력해주세요',
  })
  @Matches(PASSWORD_REG, {
    message:
      '영문, 숫자, 특수문자로 이루어질 수 있으며 특수문자는 1개 이상 포함해주세요.',
  })
  @Length(6, 60, {
    message: '패스워드의 길이는 6자 이상, 60자 이하로 작성해주세요.',
  })
  password: string;

  constructor(partial: Partial<RegisterAdminRequestDto>) {
    Object.assign(this, partial);
  }

  toEntity() {
    const admin = new Admin();
    Object.assign(admin, this);
    return admin;
  }
}
