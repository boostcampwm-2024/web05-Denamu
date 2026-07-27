import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

import { User } from '@user/entity/user.entity';

export class RegisterUserRequestDto {
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
  email: string;

  @ApiProperty({
    example: 'example1234!',
    description: '비밀번호를 입력해주세요.',
  })
  @IsString({
    message: '문자열로 입력해주세요.',
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

  @ApiProperty({
    example: '홍길동',
    description: '사용자 이름을 입력해주세요.',
  })
  @IsString({
    message: '사용자 이름은 문자열로 입력해주세요.',
  })
  @IsNotEmpty({
    message: '사용자 이름이 없습니다.',
  })
  userName: string;

  @ApiPropertyOptional({
    example: false,
    description: '마케팅 활용 및 광고성 정보 수신 동의 여부',
    required: false,
  })
  @IsOptional()
  @IsBoolean({
    message: '마케팅 정보 수신 동의 여부는 boolean이어야 합니다.',
  })
  marketingEmailAgreed?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: '미접속 알림 이메일 수신 동의 여부',
    required: false,
  })
  @IsOptional()
  @IsBoolean({
    message: '미접속 알림 이메일 수신 동의 여부는 boolean이어야 합니다.',
  })
  inactivityEmailAgreed?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: '공지사항 이메일 수신 동의 여부',
    required: false,
  })
  @IsOptional()
  @IsBoolean({
    message: '공지사항 이메일 수신 동의 여부는 boolean이어야 합니다.',
  })
  noticeEmailAgreed?: boolean;

  toEntity() {
    const user = new User();
    user.email = this.email;
    user.password = this.password;
    user.userName = this.userName;
    if (this.marketingEmailAgreed !== undefined) {
      user.marketingEmailAgreed = this.marketingEmailAgreed;
      user.marketingEmailAgreedAt = new Date();
    }
    if (this.inactivityEmailAgreed !== undefined) {
      user.inactivityEmailAgreed = this.inactivityEmailAgreed;
      user.inactivityEmailAgreedAt = new Date();
    }
    if (this.noticeEmailAgreed !== undefined) {
      user.noticeEmailAgreed = this.noticeEmailAgreed;
      user.noticeEmailAgreedAt = new Date();
    }

    return user;
  }

  constructor(partial: Partial<RegisterUserRequestDto>) {
    Object.assign(this, partial);
  }
}
