import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class ChangePasswordRequestDto {
  @ApiPropertyOptional({
    example: 'current1234!',
    description:
      '현재 비밀번호. 비밀번호가 설정된 계정은 필수, 소셜 로그인 전용 계정(비밀번호 미설정)은 생략합니다.',
    required: false,
  })
  @IsOptional()
  @IsString({
    message: '현재 비밀번호는 문자열로 입력해주세요.',
  })
  currentPassword?: string;

  @ApiProperty({
    example: 'example1234!',
    description: '새 비밀번호를 입력해주세요.',
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
  newPassword: string;

  constructor(partial: Partial<ChangePasswordRequestDto>) {
    Object.assign(this, partial);
  }
}
