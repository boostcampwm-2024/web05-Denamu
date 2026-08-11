import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import {
  IsISO8601,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateUserSuspensionRequestDto {
  @ApiProperty({ example: 1, description: '정지할 유저 ID' })
  @IsInt({ message: '정수를 입력해주세요.' })
  @Min(1, { message: '유저 ID는 1 이상이어야 합니다.' })
  @Type(() => Number)
  userId: number;

  @ApiPropertyOptional({
    description: '정지 종료 일시 (ISO 8601). 비워두면 영구 정지로 처리됩니다.',
    example: '2026-09-01T00:00:00.000Z',
    nullable: true,
  })
  @IsOptional()
  @IsISO8601({}, { message: '올바른 날짜 형식을 입력해주세요.' })
  suspendedUntil?: string;

  @ApiProperty({
    description: '정지 사유',
    example: '반복적인 스팸 댓글로 인해 7일간 정지 처리합니다.',
    maxLength: 500,
  })
  @IsNotEmpty({ message: '상세 내역을 입력해주세요.' })
  @IsString({ message: '문자열로 입력해주세요.' })
  @MaxLength(500, { message: '상세 내역은 500자 이하로 입력해주세요.' })
  detail: string;

  constructor(partial: Partial<CreateUserSuspensionRequestDto>) {
    Object.assign(this, partial);
  }
}
