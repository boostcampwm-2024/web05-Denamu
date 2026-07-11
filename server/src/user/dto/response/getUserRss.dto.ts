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
