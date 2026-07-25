import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class SearchRssRequestDto {
  @ApiProperty({
    example: 'seok3765',
    description: '검색할 RSS 블로그 이름',
  })
  @IsNotEmpty({
    message: '검색어를 입력해주세요.',
  })
  @IsString({
    message: '문자열로 입력해주세요.',
  })
  find: string;

  @ApiPropertyOptional({
    example: 1,
    description: '페이지 번호 입력',
    required: false,
  })
  @IsOptional()
  @IsInt({
    message: '페이지 번호는 정수입니다.',
  })
  @Min(1, { message: '페이지 번호는 1 이상이어야 합니다.' })
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 5,
    description: '받아올 RSS 최대 개수',
    required: false,
  })
  @IsOptional()
  @IsInt({
    message: '한 페이지에 보여줄 개수는 정수입니다.',
  })
  @Min(1, { message: '개수 제한은 1 이상이어야 합니다.' })
  @Type(() => Number)
  limit?: number = 5;

  constructor(partial: Partial<SearchRssRequestDto>) {
    Object.assign(this, partial);
  }
}
