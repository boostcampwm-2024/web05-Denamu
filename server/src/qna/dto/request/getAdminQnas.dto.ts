import { ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

import { QnaStatus } from '@qna/constant/qna.constant';

export class GetAdminQnasRequestDto {
  @ApiPropertyOptional({ example: 1, description: '조회할 페이지 번호' })
  @IsOptional()
  @Min(1, { message: 'page 값은 1 이상이어야 합니다.' })
  @IsInt({ message: '정수를 입력해주세요.' })
  @Type(() => Number)
  page: number = 1;

  @ApiPropertyOptional({ example: 10, description: '페이지당 개수' })
  @IsOptional()
  @Min(1, { message: 'limit 값은 1 이상이어야 합니다.' })
  @IsInt({ message: '정수를 입력해주세요.' })
  @Type(() => Number)
  limit: number = 10;

  @ApiPropertyOptional({
    description: '조회할 처리 상태 (미입력 시 전체 조회)',
    enum: QnaStatus,
  })
  @IsOptional()
  @IsEnum(QnaStatus, { message: '올바른 처리 상태를 입력해주세요.' })
  status?: QnaStatus;

  constructor(partial: Partial<GetAdminQnasRequestDto>) {
    Object.assign(this, partial);
  }
}
