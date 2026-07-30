import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateQnaRequestDto {
  @ApiProperty({
    description: '제목',
    example: '로그인이 안 돼요',
    maxLength: 255,
  })
  @IsString({ message: '문자열로 입력해주세요.' })
  @MaxLength(255, { message: '제목은 255자 이하로 입력해주세요.' })
  title: string;

  @ApiProperty({
    description: '문의 내용 (최초 질문)',
    example: '로그인 시도 시 계속 오류가 발생합니다.',
  })
  @IsString({ message: '문자열로 입력해주세요.' })
  content: string;

  @ApiProperty({ description: '비공개 여부' })
  @IsBoolean({ message: 'boolean 값을 입력해주세요.' })
  isSecret: boolean;

  @ApiPropertyOptional({
    description:
      '문의 확인용 비밀번호 (비회원은 항상 필수, 회원은 비공개일 때만 필수)',
    example: 'qna1234',
    minLength: 4,
    maxLength: 32,
  })
  @IsOptional()
  @IsString({ message: '문자열로 입력해주세요.' })
  @MinLength(4, { message: '비밀번호는 4자 이상으로 입력해주세요.' })
  @MaxLength(32, { message: '비밀번호는 32자 이하로 입력해주세요.' })
  password?: string;

  @ApiPropertyOptional({
    description: '작성자 이름 (비회원 작성 시 필수)',
    example: '홍길동',
    maxLength: 60,
  })
  @IsOptional()
  @IsString({ message: '문자열로 입력해주세요.' })
  @MaxLength(60, { message: '이름은 60자 이하로 입력해주세요.' })
  guestName?: string;

  @ApiPropertyOptional({
    description: '작성자 이메일 (비회원 작성 시 필수)',
    example: 'guest@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: '이메일 주소 형식에 맞춰서 작성해주세요.' })
  guestEmail?: string;

  constructor(partial: Partial<CreateQnaRequestDto>) {
    Object.assign(this, partial);
  }
}
