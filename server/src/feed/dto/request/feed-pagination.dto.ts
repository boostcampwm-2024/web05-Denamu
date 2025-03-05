import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

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

  constructor(partial: Partial<FeedPaginationRequestDto>) {
    Object.assign(this, partial);
  }
}
