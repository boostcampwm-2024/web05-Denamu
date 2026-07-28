import { ApiProperty } from '@nestjs/swagger';

import { NoticeStatus } from '@notice/constant/notice.constant';
import { Notice } from '@notice/entity/notice.entity';

export class NoticeSummaryDto {
  @ApiProperty({ example: 1, description: '공지사항 ID' })
  id: number;

  @ApiProperty({ example: '서비스 점검 안내', description: '제목' })
  title: string;

  @ApiProperty({ example: false, description: '상단 고정 여부' })
  isPinned: boolean;

  @ApiProperty({ enum: NoticeStatus, description: '공개 상태' })
  status: NoticeStatus;

  @ApiProperty({ example: null, description: '노출 시작 일시', nullable: true })
  startAt: Date | null;

  @ApiProperty({ example: null, description: '노출 종료 일시', nullable: true })
  endAt: Date | null;

  @ApiProperty({ example: '2026-07-28T12:00:00.000Z', description: '작성일시' })
  createdAt: Date;

  protected constructor(partial: Partial<NoticeSummaryDto>) {
    Object.assign(this, partial);
  }

  static fromSummary(notice: Notice): NoticeSummaryDto {
    return new NoticeSummaryDto({
      id: notice.id,
      title: notice.title,
      isPinned: notice.isPinned,
      status: notice.status,
      startAt: notice.startAt,
      endAt: notice.endAt,
      createdAt: notice.createdAt,
    });
  }

  static fromSummaryArray(notices: Notice[]): NoticeSummaryDto[] {
    return notices.map((notice) => this.fromSummary(notice));
  }
}

export class NoticeDetailDto extends NoticeSummaryDto {
  @ApiProperty({
    description: '본문 (에디터에서 작성된 HTML)',
    example: '<p>2026년 8월 1일 서비스 점검이 진행됩니다.</p>',
  })
  content: string;

  @ApiProperty({
    example: '테스트 계정',
    description: '작성자 이름 (탈퇴 등으로 계정이 없으면 null)',
    nullable: true,
  })
  authorName: string | null;

  @ApiProperty({ example: '2026-07-28T12:00:00.000Z', description: '수정일시' })
  updatedAt: Date;

  constructor(partial: Partial<NoticeDetailDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  static fromDetail(notice: Notice): NoticeDetailDto {
    return new NoticeDetailDto({
      id: notice.id,
      title: notice.title,
      isPinned: notice.isPinned,
      status: notice.status,
      startAt: notice.startAt,
      endAt: notice.endAt,
      createdAt: notice.createdAt,
      content: notice.content,
      authorName: notice.author?.name ?? null,
      updatedAt: notice.updatedAt,
    });
  }
}

export class NoticeListResponseDto {
  @ApiProperty({ type: [NoticeSummaryDto], description: '공지사항 목록' })
  result: NoticeSummaryDto[];

  @ApiProperty({ example: 1, description: '현재 페이지 번호' })
  page: number;

  @ApiProperty({ example: 10, description: '페이지당 개수' })
  limit: number;

  @ApiProperty({ example: 1, description: '전체 개수' })
  totalCount: number;

  @ApiProperty({ example: false, description: '다음 페이지 존재 여부' })
  hasMore: boolean;

  constructor(partial: Partial<NoticeListResponseDto>) {
    Object.assign(this, partial);
  }

  static of(
    notices: Notice[],
    page: number,
    limit: number,
    totalCount: number,
  ): NoticeListResponseDto {
    return new NoticeListResponseDto({
      result: NoticeSummaryDto.fromSummaryArray(notices),
      page,
      limit,
      totalCount,
      hasMore: page * limit < totalCount,
    });
  }
}
