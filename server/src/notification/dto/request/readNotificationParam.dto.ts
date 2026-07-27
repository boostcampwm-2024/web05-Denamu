import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ReadNotificationParamRequestDto {
  @ApiProperty({
    example: 1,
    description: '읽음 처리할 알림 ID',
  })
  @IsInt({
    message: '정수를 입력해주세요.',
  })
  @Min(1, { message: '알림 ID는 1 이상이어야 합니다.' })
  @Type(() => Number)
  notificationId: number;

  constructor(partial: Partial<ReadNotificationParamRequestDto>) {
    Object.assign(this, partial);
  }
}
