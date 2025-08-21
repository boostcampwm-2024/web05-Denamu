import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class FileDeleteRequestDto {
  @ApiProperty({
    example: 1,
    description: '파일 ID',
  })
  @IsInt({
    message: '숫자로 입력해주세요.',
  })
  @Min(1, { message: '파일 ID는 1 이상이어야 합니다.' })
  @Type(() => Number)
  id: number;

  constructor(partial: Partial<FileDeleteRequestDto>) {
    Object.assign(this, partial);
  }
}
