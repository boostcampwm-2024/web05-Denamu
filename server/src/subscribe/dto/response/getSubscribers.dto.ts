import { ApiProperty } from '@nestjs/swagger';

import { Subscription } from '@subscribe/entity/subscription.entity';

export class SubscriberResult {
  @ApiProperty({
    example: 1,
    description: '구독 ID (커서)',
  })
  id: number;

  @ApiProperty({
    example: { id: 2, userName: '조민석', profileImage: null },
    description: '구독자 정보',
  })
  user: {
    id: number;
    userName: string;
    profileImage: string | null;
  };

  private constructor(partial: Partial<SubscriberResult>) {
    Object.assign(this, partial);
  }

  static toResultDto(subscription: Subscription) {
    return new SubscriberResult({
      id: subscription.id,
      user: {
        id: subscription.user.id,
        userName: subscription.user.userName,
        profileImage: subscription.user.profileImage ?? null,
      },
    });
  }

  static toResultDtoArray(subscriptions: Subscription[]) {
    return subscriptions.map((subscription) => this.toResultDto(subscription));
  }
}

export class GetSubscribersResponseDto {
  @ApiProperty({ type: [SubscriberResult], description: 'RSS 구독자 목록' })
  result: SubscriberResult[];

  @ApiProperty({
    example: 1,
    description: '마지막으로 조회한 구독 ID (다음 요청의 커서)',
  })
  lastId: number;

  @ApiProperty({
    example: true,
    description: '다음 페이지 존재 여부',
  })
  hasMore: boolean;

  constructor(partial: Partial<GetSubscribersResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(
    subscriptions: Subscription[],
    lastId: number,
    hasMore: boolean,
  ) {
    return new GetSubscribersResponseDto({
      result: SubscriberResult.toResultDtoArray(subscriptions),
      lastId,
      hasMore,
    });
  }
}
