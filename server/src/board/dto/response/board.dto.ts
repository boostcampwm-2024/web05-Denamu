import { ApiProperty } from '@nestjs/swagger';

import { BoardStatus } from '@board/constant/board.constant';
import { Board } from '@board/entity/board.entity';

export class BoardSummaryDto {
  @ApiProperty({ example: 1, description: '게시글 ID' })
  id: number;

  @ApiProperty({ example: '서비스 점검 안내', description: '제목' })
  title: string;

  @ApiProperty({ example: false, description: '상단 고정 여부' })
  isPinned: boolean;

  @ApiProperty({ enum: BoardStatus, description: '공개 상태' })
  status: BoardStatus;

  @ApiProperty({ example: null, description: '노출 시작 일시', nullable: true })
  startAt: Date | null;

  @ApiProperty({ example: null, description: '노출 종료 일시', nullable: true })
  endAt: Date | null;

  @ApiProperty({ example: '2026-07-28T12:00:00.000Z', description: '작성일시' })
  createdAt: Date;

  protected constructor(partial: Partial<BoardSummaryDto>) {
    Object.assign(this, partial);
  }

  static fromSummary(board: Board): BoardSummaryDto {
    return new BoardSummaryDto({
      id: board.id,
      title: board.title,
      isPinned: board.isPinned,
      status: board.status,
      startAt: board.startAt,
      endAt: board.endAt,
      createdAt: board.createdAt,
    });
  }

  static fromSummaryArray(boards: Board[]): BoardSummaryDto[] {
    return boards.map((board) => this.fromSummary(board));
  }
}

export class BoardDetailDto extends BoardSummaryDto {
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

  constructor(partial: Partial<BoardDetailDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  static fromDetail(board: Board): BoardDetailDto {
    return new BoardDetailDto({
      id: board.id,
      title: board.title,
      isPinned: board.isPinned,
      status: board.status,
      startAt: board.startAt,
      endAt: board.endAt,
      createdAt: board.createdAt,
      content: board.content,
      authorName: board.author?.name ?? null,
      updatedAt: board.updatedAt,
    });
  }
}

export class BoardListResponseDto {
  @ApiProperty({ type: [BoardSummaryDto], description: '게시글 목록' })
  result: BoardSummaryDto[];

  @ApiProperty({ example: 1, description: '현재 페이지 번호' })
  page: number;

  @ApiProperty({ example: 10, description: '페이지당 개수' })
  limit: number;

  @ApiProperty({ example: 1, description: '전체 개수' })
  totalCount: number;

  @ApiProperty({ example: false, description: '다음 페이지 존재 여부' })
  hasMore: boolean;

  constructor(partial: Partial<BoardListResponseDto>) {
    Object.assign(this, partial);
  }

  static of(
    boards: Board[],
    page: number,
    limit: number,
    totalCount: number,
  ): BoardListResponseDto {
    return new BoardListResponseDto({
      result: BoardSummaryDto.fromSummaryArray(boards),
      page,
      limit,
      totalCount,
      hasMore: page * limit < totalCount,
    });
  }
}
