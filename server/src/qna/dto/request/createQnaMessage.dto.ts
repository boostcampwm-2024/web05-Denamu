import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateQnaMessageRequestDto {
  @ApiProperty({
    description: '추가 질문 내용',
    example: '추가로 문의드립니다. 아직도 해결되지 않았어요.',
  })
  @IsString({ message: '문자열로 입력해주세요.' })
  content: string;

  @ApiPropertyOptional({
    description: '비회원 작성 문의인 경우 본인 확인용 비밀번호',
    example: 'qna1234',
  })
  @IsOptional()
  @IsString({ message: '문자열로 입력해주세요.' })
  @MinLength(4, { message: '비밀번호는 4자 이상으로 입력해주세요.' })
  password?: string;

  constructor(partial: Partial<CreateQnaMessageRequestDto>) {
    Object.assign(this, partial);
  }
}
