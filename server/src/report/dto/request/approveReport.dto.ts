import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ApproveReportRequestDto {
  @ApiPropertyOptional({
    description: '정지 종료 일시 (ISO 8601). 비워두면 영구 정지로 처리됩니다.',
    example: '2026-09-01T00:00:00.000Z',
    nullable: true,
  })
  @IsOptional()
  @IsISO8601({}, { message: '올바른 날짜 형식을 입력해주세요.' })
  suspendedUntil?: string;

  @ApiProperty({
    description: '처리 상세 내역',
    example: '반복적인 스팸 댓글로 인해 7일간 정지 처리합니다.',
    maxLength: 500,
  })
  @IsNotEmpty({ message: '상세 내역을 입력해주세요.' })
  @IsString({ message: '문자열로 입력해주세요.' })
  @MaxLength(500, { message: '상세 내역은 500자 이하로 입력해주세요.' })
  detail: string;

  constructor(partial: Partial<ApproveReportRequestDto>) {
    Object.assign(this, partial);
  }
}
