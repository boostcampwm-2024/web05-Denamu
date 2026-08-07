import { ApiProperty } from '@nestjs/swagger';

import { QnaMessageType, QnaStatus } from '@qna/constant/qna.constant';
import { Qna } from '@qna/entity/qna.entity';
import { QnaMessage } from '@qna/entity/qnaMessage.entity';

export class QnaCreatedDto {
  @ApiProperty({ example: 1, description: '생성된 문의 ID' })
  id: number;

  constructor(partial: Partial<QnaCreatedDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(id: number): QnaCreatedDto {
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

  static toResultDto(qna: Qna): QnaSummaryDto {
    return new QnaSummaryDto({
      id: qna.id,
      title: qna.title,
      isSecret: qna.isSecret,
      status: qna.status,
      authorLabel: qna.user?.userName ?? qna.guestName ?? '',
      createdAt: qna.createdAt,
    });
  }

  static toResultDtoArray(qnas: Qna[]): QnaSummaryDto[] {
    return qnas.map((qna) => this.toResultDto(qna));
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

  static toResponseDto(
    qnas: Qna[],
    page: number,
    limit: number,
    totalCount: number,
  ): QnaListResponseDto {
    return new QnaListResponseDto({
      result: QnaSummaryDto.toResultDtoArray(qnas),
      page,
      limit,
      totalCount,
      hasMore: page * limit < totalCount,
    });
  }
}

export class QnaMessageResponseDto {
  @ApiProperty({ enum: QnaMessageType, description: '메시지 종류' })
  type: QnaMessageType;

  @ApiProperty({
    example: '아직도 해결되지 않았어요.',
    description: '메시지 내용',
  })
  content: string;

  @ApiProperty({
    example: '테스트 계정',
    description: '답변한 관리자 이름 (질문 메시지면 null)',
    nullable: true,
  })
  adminName: string | null;

  @ApiProperty({ example: '2026-07-28T12:00:00.000Z', description: '작성일시' })
  createdAt: Date;

  constructor(partial: Partial<QnaMessageResponseDto>) {
    Object.assign(this, partial);
  }

  static toResultDto(message: QnaMessage): QnaMessageResponseDto {
    return new QnaMessageResponseDto({
      type: message.type,
      content: message.content,
      adminName: message.admin?.name ?? null,
      createdAt: message.createdAt,
    });
  }
}

export class QnaDetailDto extends QnaSummaryDto {
  @ApiProperty({ example: '2026-07-28T12:00:00.000Z', description: '수정일시' })
  updatedAt: Date;

  @ApiProperty({
    type: [QnaMessageResponseDto],
    description: '질문/답변 스레드',
  })
  messages: QnaMessageResponseDto[];

  constructor(partial: Partial<QnaDetailDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  static toResponseDto(qna: Qna): QnaDetailDto {
    return new QnaDetailDto({
      id: qna.id,
      title: qna.title,
      isSecret: qna.isSecret,
      status: qna.status,
      authorLabel: qna.user?.userName ?? qna.guestName ?? '',
      createdAt: qna.createdAt,
      updatedAt: qna.updatedAt,
      messages: (qna.messages ?? []).map((message) =>
        QnaMessageResponseDto.toResultDto(message),
      ),
    });
  }
}

export class QnaLockedDto {
  @ApiProperty({ example: 1, description: '문의 ID' })
  id: number;

  @ApiProperty({ example: '로그인이 안 돼요', description: '제목' })
  title: string;

  @ApiProperty({ example: true, description: '비공개 여부' })
  isSecret: true;

  @ApiProperty({
    example: true,
    description: '비밀번호 확인이 필요한 문의임을 나타내는 플래그',
  })
  requiresPassword: true;

  constructor(partial: Partial<QnaLockedDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(qna: Qna): QnaLockedDto {
    return new QnaLockedDto({
      id: qna.id,
      title: qna.title,
      isSecret: true,
      requiresPassword: true,
    });
  }
}
