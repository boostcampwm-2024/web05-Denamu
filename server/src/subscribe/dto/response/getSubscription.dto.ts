import { ApiProperty } from '@nestjs/swagger';

export class GetSubscriptionResponseDto {
  @ApiProperty({
    example: true,
    description: '요청자의 구독 여부',
  })
  isSubscribed: boolean;

  @ApiProperty({
    example: 10,
    description: '해당 RSS의 총 구독자 수',
  })
  subscriberCount: number;

  constructor(partial: Partial<GetSubscriptionResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(isSubscribed: boolean, subscriberCount: number) {
    return new GetSubscriptionResponseDto({ isSubscribed, subscriberCount });
  }
}
