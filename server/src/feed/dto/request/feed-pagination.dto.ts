import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ALLOWED_TAGS, AllowedTag } from '../../tagType.constants';

export class FeedPaginationRequestDto {
  @IsOptional()
  @Min(0, { message: 'lastId 값은 0 이상이어야 합니다.' })
  @IsInt({
    message: '정수를 입력해주세요.',
  })
  @Type(() => Number)
  lastId?: number;

  @IsOptional()
  @Min(1, { message: 'limit 값은 1 이상이어야 합니다.' })
  @IsInt({
    message: '정수를 입력해주세요.',
  })
  @Type(() => Number)
  limit?: number = 12;

  @IsOptional()
  @IsIn(ALLOWED_TAGS, {
    each: true,
    message: `tag 값은 ${ALLOWED_TAGS.join(', ')} 목록에 포함 되어야 합니다.`,
  })
  @Type(() => Array)
  tags?: AllowedTag[];

  constructor(partial: Partial<FeedPaginationRequestDto>) {
    Object.assign(this, partial);
  }
}
