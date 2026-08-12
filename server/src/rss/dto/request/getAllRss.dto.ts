import { ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

import { BLOG_PLATFORMS } from '@rss/util/blogUrlToRss';

export class GetAllRssRequestDto {
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
    example: 20,
    description: '받아올 RSS 최대 개수',
    required: false,
  })
  @IsOptional()
  @IsInt({
    message: '한 페이지에 보여줄 개수는 정수입니다.',
  })
  @Min(1, { message: '개수 제한은 1 이상이어야 합니다.' })
  @Max(100, { message: '개수 제한은 100 이하여야 합니다.' })
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    example: 'velog',
    description: '필터링할 RSS 블로그 플랫폼',
    enum: BLOG_PLATFORMS,
    required: false,
  })
  @IsOptional()
  @IsIn(BLOG_PLATFORMS, {
    message: `blogPlatform은 ${BLOG_PLATFORMS.join(', ')} 중 하나여야 합니다.`,
  })
  blogPlatform?: string;

  constructor(partial: Partial<GetAllRssRequestDto>) {
    Object.assign(this, partial);
  }
}
