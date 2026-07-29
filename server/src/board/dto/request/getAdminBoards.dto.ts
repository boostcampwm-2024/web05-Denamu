import { ApiPropertyOptional } from '@nestjs/swagger';

import { BoardStatus } from '@board/constant/board.constant';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export class GetAdminBoardsRequestDto {
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
    description: '조회할 공개 상태 (미입력 시 전체 조회)',
    enum: BoardStatus,
  })
  @IsOptional()
  @IsEnum(BoardStatus, { message: '올바른 공개 상태를 입력해주세요.' })
  status?: BoardStatus;

  constructor(partial: Partial<GetAdminBoardsRequestDto>) {
    Object.assign(this, partial);
  }
}
