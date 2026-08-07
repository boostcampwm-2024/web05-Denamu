import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserRequestDto {
  @ApiPropertyOptional({
    example: '김개발',
    description: '변경할 사용자 이름',
    required: false,
  })
  @IsOptional()
  @IsString({
    message: '사용자 이름은 문자열이어야 합니다.',
  })
  @MaxLength(60, {
    message: '사용자 이름은 60자 이하여야 합니다.',
  })
  userName?: string;

  @ApiPropertyOptional({
    example: '안녕하세요! 김개발입니다.',
    description: '변경할 자기소개',
    required: false,
  })
  @IsOptional()
  @IsString({
    message: '자기소개는 문자열이어야 합니다.',
  })
  @MaxLength(500, {
    message: '자기소개는 500자 이하여야 합니다.',
  })
  introduction?: string;

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

  constructor(partial: Partial<UpdateUserRequestDto>) {
    Object.assign(this, partial);
  }
}
