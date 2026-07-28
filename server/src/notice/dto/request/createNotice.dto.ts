import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { NoticeStatus } from '@notice/constant/notice.constant';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateNoticeRequestDto {
  @ApiProperty({
    description: '제목',
    example: '서비스 점검 안내',
    maxLength: 255,
  })
  @IsString({ message: '문자열로 입력해주세요.' })
  @MaxLength(255, { message: '제목은 255자 이하로 입력해주세요.' })
  title: string;

  @ApiProperty({
    description: '본문 (에디터에서 작성된 HTML)',
    example: '<p>2026년 8월 1일 서비스 점검이 진행됩니다.</p>',
  })
  @IsString({ message: '문자열로 입력해주세요.' })
  content: string;

  @ApiPropertyOptional({ description: '상단 고정 여부', default: false })
  @IsOptional()
  @IsBoolean({ message: 'boolean 값을 입력해주세요.' })
  isPinned?: boolean;

  @ApiPropertyOptional({
    description: '공개 상태 (미입력 시 임시저장)',
    enum: NoticeStatus,
  })
  @IsOptional()
  @IsEnum(NoticeStatus, { message: '올바른 공개 상태를 선택해주세요.' })
  status?: NoticeStatus;

  @ApiPropertyOptional({
    description: '노출 시작 일시 (ISO 8601)',
    example: '2026-08-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601({}, { message: '올바른 날짜 형식을 입력해주세요.' })
  startAt?: string;

  @ApiPropertyOptional({
    description: '노출 종료 일시 (ISO 8601)',
    example: '2026-08-31T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601({}, { message: '올바른 날짜 형식을 입력해주세요.' })
  endAt?: string;

  constructor(partial: Partial<CreateNoticeRequestDto>) {
    Object.assign(this, partial);
  }
}
