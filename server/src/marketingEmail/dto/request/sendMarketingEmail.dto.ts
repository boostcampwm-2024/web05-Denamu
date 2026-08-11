import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import { IsString, MaxLength } from 'class-validator';

import { sanitizeBoardContent } from '@common/util/sanitizeHtml';

export class SendMarketingEmailRequestDto {
  @ApiProperty({
    description: '제목 (발송 시 제목 맨 앞에 "(광고)"가 자동으로 붙습니다)',
    example: '8월 신규 기능 소식을 전해드려요',
    maxLength: 255,
  })
  @IsString({ message: '문자열로 입력해주세요.' })
  @MaxLength(255, { message: '제목은 255자 이하로 입력해주세요.' })
  subject: string;

  @ApiProperty({
    description: '본문 (에디터에서 작성된 HTML)',
    example: '<p>이번 달 새로운 기능을 소개합니다.</p>',
  })
  @IsString({ message: '문자열로 입력해주세요.' })
  @Transform(({ value }) => sanitizeBoardContent(value))
  content: string;

  constructor(partial: Partial<SendMarketingEmailRequestDto>) {
    Object.assign(this, partial);
  }
}
