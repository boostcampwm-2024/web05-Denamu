import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class OAuthRegistrationRequestDto {
  @ApiProperty({
    example: '홍길동',
    description: '사용할 닉네임을 입력해주세요.',
  })
  @IsString({ message: '닉네임은 문자열로 입력해주세요.' })
  @IsNotEmpty({ message: '닉네임이 없습니다.' })
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

  constructor(partial: Partial<OAuthRegistrationRequestDto>) {
    Object.assign(this, partial);
  }
}
