import { ApiProperty } from '@nestjs/swagger';

import { QnaStatus } from '@qna/constant/qna.constant';
import { Qna } from '@qna/entity/qna.entity';

export class QnaCreatedDto {
  @ApiProperty({ example: 1, description: '생성된 문의 ID' })
  id: number;

  constructor(partial: Partial<QnaCreatedDto>) {
    Object.assign(this, partial);
  }

  static of(id: number): QnaCreatedDto {
    return new QnaCreatedDto({ id });
  }
}

export class QnaSummaryDto {
  @ApiProperty({ example: 1, description: '문의 ID' })
  id: number;

  @ApiProperty({ example: '로그인이 안 돼요', description: '제목' })
  title: string;

  @ApiProperty({ example: false, description: '비공개 여부' })
  isSecret: boolean;

  @ApiProperty({ enum: QnaStatus, description: '처리 상태' })
  status: QnaStatus;

  @ApiProperty({
    example: '홍길동',
    description: '작성자 표기 (회원이면 닉네임, 비회원이면 입력한 이름)',
  })
  authorLabel: string;

  @ApiProperty({ example: '2026-07-28T12:00:00.000Z', description: '작성일시' })
  createdAt: Date;

  protected constructor(partial: Partial<QnaSummaryDto>) {
    Object.assign(this, partial);
  }

  static fromSummary(qna: Qna): QnaSummaryDto {
    return new QnaSummaryDto({
      id: qna.id,
      title: qna.title,
      isSecret: qna.isSecret,
      status: qna.status,
      authorLabel: qna.user?.userName ?? qna.guestName ?? '',
      createdAt: qna.createdAt,
    });
  }

  static fromSummaryArray(qnas: Qna[]): QnaSummaryDto[] {
    return qnas.map((qna) => this.fromSummary(qna));
  }
}

export class QnaListResponseDto {
  @ApiProperty({ type: [QnaSummaryDto], description: '문의 목록' })
  result: QnaSummaryDto[];

  @ApiProperty({ example: 1, description: '현재 페이지 번호' })
  page: number;

  @ApiProperty({ example: 10, description: '페이지당 개수' })
  limit: number;

  @ApiProperty({ example: 1, description: '전체 개수' })
  totalCount: number;

  @ApiProperty({ example: false, description: '다음 페이지 존재 여부' })
  hasMore: boolean;

  constructor(partial: Partial<QnaListResponseDto>) {
    Object.assign(this, partial);
  }

  static of(
    qnas: Qna[],
    page: number,
    limit: number,
    totalCount: number,
  ): QnaListResponseDto {
    return new QnaListResponseDto({
      result: QnaSummaryDto.fromSummaryArray(qnas),
      page,
      limit,
      totalCount,
      hasMore: page * limit < totalCount,
    });
  }
}
