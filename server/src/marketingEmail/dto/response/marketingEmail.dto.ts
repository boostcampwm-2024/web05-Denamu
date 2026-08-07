import { ApiProperty } from '@nestjs/swagger';

import { MarketingEmail } from '@marketingEmail/entity/marketingEmail.entity';

export class MarketingEmailSummaryDto {
  @ApiProperty({ example: 1, description: '발송 ID' })
  id: number;

  @ApiProperty({
    example: '8월 신규 기능 소식을 전해드려요',
    description: '제목',
  })
  subject: string;

  @ApiProperty({ example: 128, description: '수신자 수' })
  recipientCount: number;

  @ApiProperty({
    example: '테스트 계정',
    description: '발송한 관리자 이름 (탈퇴 등으로 계정이 없으면 null)',
    nullable: true,
  })
  authorName: string | null;

  @ApiProperty({ example: '2026-08-06T12:00:00.000Z', description: '발송일시' })
  createdAt: Date;

  constructor(partial: Partial<MarketingEmailSummaryDto>) {
    Object.assign(this, partial);
  }

  static toResultDto(marketingEmail: MarketingEmail): MarketingEmailSummaryDto {
    return new MarketingEmailSummaryDto({
      id: marketingEmail.id,
      subject: marketingEmail.subject,
      recipientCount: marketingEmail.recipientCount,
      authorName: marketingEmail.author?.name ?? null,
      createdAt: marketingEmail.createdAt,
    });
  }

  static toResultDtoArray(
    marketingEmails: MarketingEmail[],
  ): MarketingEmailSummaryDto[] {
    return marketingEmails.map((marketingEmail) =>
      this.toResultDto(marketingEmail),
    );
  }
}

export class MarketingEmailDetailDto {
  @ApiProperty({ example: 1, description: '발송 ID' })
  id: number;

  @ApiProperty({
    example: '8월 신규 기능 소식을 전해드려요',
    description: '제목',
  })
  subject: string;

  @ApiProperty({
    example: '<p>안녕하세요, 회원님!</p>',
    description: '본문 (HTML)',
  })
  content: string;

  @ApiProperty({ example: 128, description: '수신자 수' })
  recipientCount: number;

  @ApiProperty({
    example: '테스트 계정',
    description: '발송한 관리자 이름 (탈퇴 등으로 계정이 없으면 null)',
    nullable: true,
  })
  authorName: string | null;

  @ApiProperty({ example: '2026-08-06T12:00:00.000Z', description: '발송일시' })
  createdAt: Date;

  constructor(partial: Partial<MarketingEmailDetailDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(
    marketingEmail: MarketingEmail,
  ): MarketingEmailDetailDto {
    return new MarketingEmailDetailDto({
      id: marketingEmail.id,
      subject: marketingEmail.subject,
      content: marketingEmail.content,
      recipientCount: marketingEmail.recipientCount,
      authorName: marketingEmail.author?.name ?? null,
      createdAt: marketingEmail.createdAt,
    });
  }
}

export class MarketingEmailListResponseDto {
  @ApiProperty({
    type: [MarketingEmailSummaryDto],
    description: '발송 이력 목록',
  })
  result: MarketingEmailSummaryDto[];

  @ApiProperty({ example: 1, description: '현재 페이지 번호' })
  page: number;

  @ApiProperty({ example: 10, description: '페이지당 개수' })
  limit: number;

  @ApiProperty({ example: 1, description: '전체 개수' })
  totalCount: number;

  @ApiProperty({ example: false, description: '다음 페이지 존재 여부' })
  hasMore: boolean;

  constructor(partial: Partial<MarketingEmailListResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(
    marketingEmails: MarketingEmail[],
    page: number,
    limit: number,
    totalCount: number,
  ): MarketingEmailListResponseDto {
    return new MarketingEmailListResponseDto({
      result: MarketingEmailSummaryDto.toResultDtoArray(marketingEmails),
      page,
      limit,
      totalCount,
      hasMore: page * limit < totalCount,
    });
  }
}
