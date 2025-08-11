import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class FileDeleteRequestDto {
  @ApiProperty({
    example: 1,
    description: '파일 ID',
  })
  @IsInt({
    message: '숫자로 입력해주세요.',
  })
  @Type(() => Number)
  id: number;

  constructor(partial: Partial<FileDeleteRequestDto>) {
    Object.assign(this, partial);
  }
}
