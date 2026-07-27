import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { ReportReason } from '@report/constant/report.constant';

export class CreateReportRequestDto {
  @ApiProperty({
    description: '신고 사유',
    enum: ReportReason,
    example: ReportReason.SPAM,
  })
  @IsEnum(ReportReason, { message: '올바른 신고 사유를 선택해주세요.' })
  reason: ReportReason;

  @ApiPropertyOptional({
    description: '신고 상세 내용',
    example: '광고성 댓글을 반복해서 작성했습니다.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: '문자열로 입력해주세요.' })
  @MaxLength(500, { message: '상세 내용은 500자 이하로 입력해주세요.' })
  detail?: string;

  constructor(partial: Partial<CreateReportRequestDto>) {
    Object.assign(this, partial);
  }
}
