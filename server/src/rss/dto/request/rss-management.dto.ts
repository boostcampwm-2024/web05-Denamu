import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class RssManagementRequestDto {
  @IsInt({
    message: '정수를 입력해주세요.',
  })
  @Type(() => Number)
  id: number;

  constructor(partial: Partial<RssManagementRequestDto>) {
    Object.assign(this, partial);
  }
}
