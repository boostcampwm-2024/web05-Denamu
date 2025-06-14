import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class FeedLikeRequestDto {
  @ApiProperty({
    example: 1,
    description: '좋아요 등록 및 취소할 피드 ID 입력',
  })
  @IsInt({
    message: '정수를 입력해주세요.',
  })
  @Min(1, { message: '조회하고자 하는 피드 ID는 1보다 커야합니다.' })
  @Type(() => Number)
  feedId: number;

  constructor(partial: Partial<FeedLikeRequestDto>) {
    Object.assign(this, partial);
  }
}
