import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

import { Admin } from '@admin/entity/admin.entity';

const PASSWORD_REG = /^(?=.*[!@#$%^&*()_+])[A-Za-z0-9!@#$%^&*()_+]+$/;

export class RegisterAdminRequestDto {
  @ApiProperty({
    example: 'test1234!',
    description:
      '패스워드를 입력해주세요. (최소 6자, 영문/숫자/특수문자로 이루어질 수 있으며 특수문자 1개 이상 포함)',
  })
  @IsNotEmpty({
    message: '비밀번호가 없습니다.',
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

  @ApiProperty({
    example: '홍길동',
    description: '관리자 이름을 입력해주세요.',
  })
  @IsNotEmpty({
    message: '이름이 없습니다.',
  })
  @IsString({
    message: '문자열을 입력해주세요',
  })
  @Length(1, 255, {
    message: '이름의 길이는 1자 이상, 255자 이하로 작성해주세요.',
  })
  name: string;

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

  constructor(partial: Partial<RegisterAdminRequestDto>) {
    Object.assign(this, partial);
  }

  toEntity() {
    const admin = new Admin();
    Object.assign(admin, this);
    return admin;
  }
}
