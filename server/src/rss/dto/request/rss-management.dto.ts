import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RssManagementRequestDto {
  @ApiProperty({
    example: 1,
    description: 'RSS ID',
  })
  @IsInt({
    message: '정수를 입력해주세요.',
  })
  @Type(() => Number)
  id: number;

  constructor(partial: Partial<RssManagementRequestDto>) {
    Object.assign(this, partial);
  }
}
