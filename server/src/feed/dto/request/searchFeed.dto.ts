import {
  IsNotEmpty,
  IsEnum,
  IsInt,
  IsString,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum SearchType {
  TITLE = 'title',
  BLOGNAME = 'blogName',
  ALL = 'all',
}

export class SearchFeedRequestDto {
  @ApiProperty({
    example: 'example',
    description: '검색어 입력',
  })
  @IsNotEmpty({
    message: '검색어를 입력해주세요.',
  })
  @IsString({
    message: '문자열로 입력해주세요.',
  })
  find: string;

  @ApiProperty({
    example: 'example',
    description: '검색 타입 입력',
    enum: ['title', 'blogName', 'all'],
  })
  @IsNotEmpty({
    message: '검색 타입을 입력해주세요.',
  })
  @IsEnum(SearchType, {
    message: '검색 타입은 title, blogName, all 중 하나여야 합니다.',
  })
  type: SearchType;

  @ApiProperty({
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

  @ApiProperty({
    example: 1,
    description: '받아올 게시글 최대 개수',
    required: false,
  })
  @IsOptional()
  @IsInt({
    message: '한 페이지에 보여줄 개수는 정수입니다.',
  })
  @Min(1, { message: '개수 제한은 1 이상이어야 합니다.' })
  @Type(() => Number)
  limit?: number = 4;

  constructor(partial: Partial<SearchFeedRequestDto>) {
    Object.assign(this, partial);
  }
}
