import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ManageRssRequestDto {
  @ApiProperty({
    example: 1,
    description: 'RSS ID',
  })
  @IsInt({
    message: '정수를 입력해주세요.',
  })
  @Min(1, { message: 'RSS ID는 1 이상이어야 합니다.' })
  @Type(() => Number)
  id: number;

  constructor(partial: Partial<ManageRssRequestDto>) {
    Object.assign(this, partial);
  }
}
