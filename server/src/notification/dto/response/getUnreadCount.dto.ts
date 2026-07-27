import { ApiProperty } from '@nestjs/swagger';

export class GetUnreadCountResponseDto {
  @ApiProperty({ example: 3, description: '읽지 않은 알림 개수' })
  count: number;

  constructor(partial: Partial<GetUnreadCountResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(count: number) {
    return new GetUnreadCountResponseDto({ count });
  }
}
