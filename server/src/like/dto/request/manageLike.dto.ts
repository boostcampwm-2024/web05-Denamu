import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ManageLikeRequestDto {
  @ApiProperty({
    example: 1,
    description: '좋아요 등록 및 취소, 조회할 피드 ID 입력',
  })
  @IsInt({
    message: '정수를 입력해주세요.',
  })
  @Min(1, { message: '게시글 ID는 1 이상이어야 합니다.' })
  @Type(() => Number)
  feedId: number;

  constructor(partial: Partial<ManageLikeRequestDto>) {
    Object.assign(this, partial);
  }
}
