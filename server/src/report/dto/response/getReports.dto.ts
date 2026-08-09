import { ApiProperty } from '@nestjs/swagger';

import {
  ReportReason,
  ReportTargetType,
} from '@report/constant/report.constant';
import { Report } from '@report/entity/report.entity';

const resolveTargetLabel = (report: Report): string | null => {
  switch (report.targetType) {
    case ReportTargetType.USER:
      return report.reportedUser?.userName ?? null;
    case ReportTargetType.RSS:
      return report.reportedRss?.name ?? null;
    case ReportTargetType.COMMENT:
      return report.reportedComment?.comment ?? null;
    case ReportTargetType.FEED:
      return report.reportedFeed?.title ?? null;
    default:
      return null;
  }
};

export class ReportResult {
  @ApiProperty({ example: 1, description: '신고 ID' })
  id: number;

  @ApiProperty({ enum: ReportTargetType, description: '신고 대상 타입' })
  targetType: ReportTargetType;

  @ApiProperty({ example: 1, description: '신고 대상 ID' })
  targetId: number;

  @ApiProperty({
    example: '스팸 댓글입니다.',
    description:
      '신고 대상을 식별하기 위한 표시용 텍스트 (대상이 삭제된 경우 null)',
    nullable: true,
  })
  targetLabel: string | null;

  @ApiProperty({ enum: ReportReason, description: '신고 사유' })
  reason: ReportReason;

  @ApiProperty({ example: null, description: '신고 상세 내용', nullable: true })
  detail: string | null;

  @ApiProperty({
    example: { id: 1, userName: '테스트 계정' },
    description: '신고자 정보',
  })
  reporter: { id: number; userName: string };

  @ApiProperty({
    example: '2025-08-16T12:00:00.000Z',
    description: '신고 접수 일시',
  })
  createdAt: Date;

  @ApiProperty({
    example: null,
    description: '처리 일시 (미처리 시 null)',
    nullable: true,
  })
  reviewedAt: Date | null;

  private constructor(partial: Partial<ReportResult>) {
    Object.assign(this, partial);
  }

  static toResultDto(report: Report) {
    return new ReportResult({
      id: report.id,
      targetType: report.targetType,
      targetId: report.targetId,
      targetLabel: resolveTargetLabel(report),
      reason: report.reason,
      detail: report.detail,
      reporter: {
        id: report.reporter.id,
        userName: report.reporter.userName,
      },
      createdAt: report.createdAt,
      reviewedAt: report.reviewedAt,
    });
  }

  static toResultDtoArray(reports: Report[]) {
    return reports.map((report) => this.toResultDto(report));
  }
}

export class GetReportsResponseDto {
  @ApiProperty({ type: [ReportResult], description: '신고 목록' })
  result: ReportResult[];

  @ApiProperty({
    example: 1,
    description: '마지막으로 조회한 신고 ID (다음 요청의 커서)',
  })
  lastId: number;

  @ApiProperty({ example: true, description: '다음 페이지 존재 여부' })
  hasMore: boolean;

  constructor(partial: Partial<GetReportsResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(reports: Report[], lastId: number, hasMore: boolean) {
    return new GetReportsResponseDto({
      result: ReportResult.toResultDtoArray(reports),
      lastId,
      hasMore,
    });
  }
}
