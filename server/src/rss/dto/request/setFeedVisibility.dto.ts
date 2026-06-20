import { ApiProperty } from '@nestjs/swagger';

import { IsBoolean } from 'class-validator';

export class SetFeedVisibilityRequestDto {
  @ApiProperty({
    example: false,
    description: '공개 여부 (true: 공개, false: 비공개)',
  })
  @IsBoolean({
    message: 'isPublic 값은 boolean이어야 합니다.',
  })
  isPublic: boolean;

  constructor(partial: Partial<SetFeedVisibilityRequestDto>) {
    Object.assign(this, partial);
  }
}
