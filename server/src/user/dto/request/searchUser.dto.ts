import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class SearchUserRequestDto {
  @ApiProperty({
    example: '김개발',
    description: '검색할 유저 닉네임',
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
    description: '받아올 유저 최대 개수',
    required: false,
  })
  @IsOptional()
  @IsInt({
    message: '한 페이지에 보여줄 개수는 정수입니다.',
  })
  @Min(1, { message: '개수 제한은 1 이상이어야 합니다.' })
  @Type(() => Number)
  limit?: number = 5;

  constructor(partial: Partial<SearchUserRequestDto>) {
    Object.assign(this, partial);
  }
}
