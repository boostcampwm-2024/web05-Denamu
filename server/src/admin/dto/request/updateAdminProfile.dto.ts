import { ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

const PASSWORD_REG = /^(?=.*[!@#$%^&*()_+])[A-Za-z0-9!@#$%^&*()_+]+$/;

export class UpdateAdminProfileRequestDto {
  @ApiPropertyOptional({
    example: '홍길동',
    description: '변경할 관리자 이름. 미입력 시 기존 이름 유지',
  })
  @IsOptional()
  @IsString({
    message: '문자열을 입력해주세요',
  })
  @Length(1, 255, {
    message: '이름의 길이는 1자 이상, 255자 이하로 작성해주세요.',
  })
  name?: string;

  @ApiPropertyOptional({
    example: 'test1234!',
    description:
      '변경할 비밀번호. 미입력 시 기존 비밀번호 유지. (최소 6자, 특수문자 1개 이상 포함)',
  })
  @IsOptional()
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
  password?: string;

  @ApiPropertyOptional({
    example: true,
    description: '이메일 수신 여부',
  })
  @IsOptional()
  @IsBoolean({
    message: '불리언 값을 입력해주세요',
  })
  emailNotification?: boolean;
}
