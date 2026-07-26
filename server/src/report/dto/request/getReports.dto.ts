import { ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

import { ReportStatus, ReportTargetType } from '@report/constant/report.constant';

export class GetReportsRequestDto {
  @ApiPropertyOptional({
    description: '조회할 처리 상태 (미입력 시 전체 조회)',
    enum: ReportStatus,
  })
  @IsOptional()
  @IsEnum(ReportStatus, { message: '올바른 처리 상태를 입력해주세요.' })
  status?: ReportStatus;

  @ApiPropertyOptional({
    description: '조회할 신고 대상 타입 (미입력 시 전체 조회)',
    enum: ReportTargetType,
  })
  @IsOptional()
  @IsEnum(ReportTargetType, { message: '올바른 신고 대상 타입을 입력해주세요.' })
  targetType?: ReportTargetType;

  @ApiPropertyOptional({
    example: 1,
    description: '마지막으로 조회한 신고 ID (커서)',
  })
  @IsOptional()
  @Min(1, { message: 'lastId 값은 1 이상이어야 합니다.' })
  @IsInt({ message: '정수를 입력해주세요.' })
  @Type(() => Number)
  lastId?: number;

  @ApiPropertyOptional({
    example: 10,
    description: '받아올 최대 신고 개수',
  })
  @IsOptional()
  @Min(1, { message: 'limit 값은 1 이상이어야 합니다.' })
  @IsInt({ message: '정수를 입력해주세요.' })
  @Type(() => Number)
  limit?: number = 10;

  constructor(partial: Partial<GetReportsRequestDto>) {
    Object.assign(this, partial);
  }
}
