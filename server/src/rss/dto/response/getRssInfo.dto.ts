import { ApiProperty } from '@nestjs/swagger';

import { RssAccept } from '@rss/entity/rss.entity';

export class RssOwnerDto {
  @ApiProperty({
    example: 1,
    description: '소유자(User) ID',
  })
  id: number;

  @ApiProperty({
    example: '김개발',
    description: '소유자 이름',
  })
  userName: string;

  @ApiProperty({
    example: 'https://denamu.dev/objects/PROFILE_IMAGE/uuid.png',
    description: '소유자 프로필 이미지 URL (미설정 시 null)',
    nullable: true,
  })
  profileImage: string | null;
}

export class GetRssInfoResponseDto {
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
    example: false,
    description: '요청자가 해당 RSS의 소유자인지 여부 (비로그인 시 false)',
  })
  isOwner: boolean;

  @ApiProperty({
    example: '2025-01-01T00:00:00.000Z',
    description: '가장 최근 게시글의 발행 일자 (게시글 없으면 null)',
    nullable: true,
  })
  lastPublishedAt: Date | null;

  @ApiProperty({
    type: RssOwnerDto,
    description: '소유자 정보 (소유자 없으면 null → 미인증 RSS)',
    nullable: true,
  })
  owner: RssOwnerDto | null;

  @ApiProperty({
    example: false,
    description: '요청자가 해당 RSS를 차단했는지 여부 (비로그인 시 false)',
  })
  isBlocked: boolean;

  @ApiProperty({
    example: 'https://blog-platform.com/blog-profile-image.png',
    description: 'RSS 피드에서 추출한 블로그 프로필 이미지 URL (미설정 시 null)',
    nullable: true,
  })
  blogImage: string | null;

  constructor(partial: Partial<GetRssInfoResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(
    rssAccept: RssAccept,
    feedCount: number,
    subscriberCount: number,
    isSubscribed: boolean,
    isOwner: boolean,
    lastPublishedAt: Date | null,
    isBlocked = false,
  ) {
    const owner = rssAccept.user
      ? {
          id: rssAccept.user.id,
          userName: rssAccept.user.userName,
          profileImage: rssAccept.user.profileImage ?? null,
        }
      : null;

    return new GetRssInfoResponseDto({
      id: rssAccept.id,
      name: rssAccept.name,
      userName: rssAccept.userName,
      rssUrl: rssAccept.rssUrl,
      blogPlatform: rssAccept.blogPlatform,
      feedCount,
      subscriberCount,
      isSubscribed,
      isOwner,
      lastPublishedAt,
      owner,
      isBlocked,
      blogImage: rssAccept.blogImage ?? null,
    });
  }
}
