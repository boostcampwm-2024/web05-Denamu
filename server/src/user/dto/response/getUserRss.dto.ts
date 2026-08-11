import { ApiProperty } from '@nestjs/swagger';

import { RssAccept } from '@rss/entity/rss.entity';

export class GetUserRssResponseDto {
  @ApiProperty({
    example: 1,
    description: 'RSS(rss_accept) ID',
  })
  id: number;

  @ApiProperty({
    example: 'seok3765.log',
    description: 'RSS 블로그 이름',
  })
  name: string;

  @ApiProperty({
    example: '조민석',
    description: 'RSS 블로그에 등록된 신청자 이름',
  })
  userName: string;

  @ApiProperty({
    example: 'https://v2.velog.io/rss/@seok3765',
    description: 'RSS URL',
  })
  rssUrl: string;

  @ApiProperty({
    example: 'velog',
    description: 'RSS 블로그 플랫폼 종류',
  })
  blogPlatform: string;

  @ApiProperty({
    example: 0,
    description: 'RSS의 공개 게시글 수',
  })
  feedCount: number;

  @ApiProperty({
    example: 0,
    description: 'RSS의 총 구독자 수',
  })
  subscriberCount: number;

  @ApiProperty({
    example: false,
    description: '요청자가 해당 RSS를 구독 중인지 여부 (비로그인 시 false)',
  })
  isSubscribed: boolean;

  @ApiProperty({
    example: 'https://blog-platform.com/blog-profile-image.png',
    description:
      'RSS 피드에서 추출한 블로그 프로필 이미지 URL (미설정 시 null)',
    nullable: true,
  })
  blogImage: string | null;

  @ApiProperty({
    example: 0,
    description: '해당 RSS가 정지당한 횟수',
  })
  suspensionCount: number;

  constructor(partial: Partial<GetUserRssResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(
    rssAccept: RssAccept,
    feedCount: number,
    subscriberCount: number,
    isSubscribed: boolean,
  ) {
    return new GetUserRssResponseDto({
      id: rssAccept.id,
      name: rssAccept.name,
      userName: rssAccept.userName,
      rssUrl: rssAccept.rssUrl,
      blogPlatform: rssAccept.blogPlatform,
      feedCount,
      subscriberCount,
      isSubscribed,
      blogImage: rssAccept.blogImage ?? null,
      suspensionCount: rssAccept.suspensionCount,
    });
  }

  static toResponseDtoArray(
    rssAcceptList: RssAccept[],
    feedCountMap: Map<number, number>,
    subscriberCountMap: Map<number, number>,
    subscribedBlogIds: Set<number>,
  ) {
    return rssAcceptList.map((rssAccept) =>
      this.toResponseDto(
        rssAccept,
        feedCountMap.get(rssAccept.id) ?? 0,
        subscriberCountMap.get(rssAccept.id) ?? 0,
        subscribedBlogIds.has(rssAccept.id),
      ),
    );
  }
}
