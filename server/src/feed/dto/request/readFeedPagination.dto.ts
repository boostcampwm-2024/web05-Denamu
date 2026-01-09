import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ALLOWED_TAGS, AllowedTag } from '@feed/constant/tagType.constants';
import { ApiProperty } from '@nestjs/swagger';

export class ReadFeedPaginationRequestDto {
  @ApiProperty({
    example: 1,
    description: '마지막 피드 ID',
    required: false,
  })
  @IsOptional()
  @Min(0, { message: 'lastId 값은 0 이상이어야 합니다.' })
  @IsInt({
    message: '정수를 입력해주세요.',
  })
  @Type(() => Number)
  lastId?: number;

  @ApiProperty({
    example: 1,
    description: '받아올 최대 게시글 개수',
    required: false,
  })
  @IsOptional()
  @Min(0, { message: 'limit 값은 0 이상이어야 합니다.' })
  @IsInt({
    message: '정수를 입력해주세요.',
  })
  @Type(() => Number)
  limit?: number = 12;

  @ApiProperty({
    example: 'example1,example2,example3',
    description: '필터링할 태그(쿼리 배열)',
    required: false,
  })
  @IsOptional()
  @IsIn(ALLOWED_TAGS, {
    each: true,
    message: `tag 값은 ${ALLOWED_TAGS.join(', ')} 목록에 포함 되어야 합니다.`,
  })
  @Type(() => Array)
  tags?: AllowedTag[];

  constructor(partial: Partial<ReadFeedPaginationRequestDto>) {
    Object.assign(this, partial);
  }
}
