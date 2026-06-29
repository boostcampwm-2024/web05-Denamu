import { ApiProperty } from '@nestjs/swagger';

import { Subscription } from '@subscribe/entity/subscription.entity';

export class SubscriberResult {
  @ApiProperty({
    example: 1,
    description: '구독 ID (커서)',
  })
  id: number;

  @ApiProperty({
    example: 2,
    description: '구독자 사용자 ID',
  })
  userId: number;

  @ApiProperty({
    example: '조민석',
    description: '구독자 닉네임',
  })
  userName: string;

  @ApiProperty({
    example: 'https://example.com/profile.png',
    description: '구독자 프로필 이미지 URL',
    nullable: true,
  })
  profileImage: string | null;

  private constructor(partial: Partial<SubscriberResult>) {
    Object.assign(this, partial);
  }

  static toResultDto(subscription: Subscription) {
    return new SubscriberResult({
      id: subscription.id,
      userId: subscription.user.id,
      userName: subscription.user.userName,
      profileImage: subscription.user.profileImage ?? null,
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
