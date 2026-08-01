import { ApiProperty } from '@nestjs/swagger';

import { RssReject } from '@rss/entity/rss.entity';

export class ReadRssRejectHistoryResponseDto {
  @ApiProperty({
    example: 1,
    description: 'RSS 거절 ID',
  })
  id: number;

  @ApiProperty({
    example: 'example blog name',
    description: '블로그 이름',
  })
  name: string;

  @ApiProperty({
    example: 'example user name',
    description: '신청자 이름',
  })
  userName: string;

  @ApiProperty({
    example: 'example@email.com',
    description: 'RSS 결과 받을 email 주소',
  })
  email: string;

  @ApiProperty({
    example: 'https://example.com/rssUrl',
    description: 'RSS 주소',
  })
  rssUrl: string;

  @ApiProperty({
    example: 'example reject description',
    description: '거절 사유',
  })
  description: string;

  @ApiProperty({
    example: 'velog',
    description: 'RSS URL로부터 추정한 블로그 플랫폼 종류',
  })
  blogPlatform: string;

  @ApiProperty({
    example: 'https://blog-platform.com/blog-profile-image.png',
    description: 'RSS 피드에서 추출한 블로그 프로필 이미지 URL (미설정 시 null)',
    nullable: true,
  })
  blogImage: string | null;

  constructor(partial: Partial<ReadRssRejectHistoryResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(rssReject: RssReject) {
    return new ReadRssRejectHistoryResponseDto({
      id: rssReject.id,
      name: rssReject.name,
      userName: rssReject.userName,
      email: rssReject.email,
      rssUrl: rssReject.rssUrl,
      description: rssReject.description,
      blogPlatform: rssReject.blogPlatform,
      blogImage: rssReject.blogImage ?? null,
    });
  }

  static toResponseDtoArray(rssRejectList: RssReject[]) {
    return rssRejectList.map((rssReject) => this.toResponseDto(rssReject));
  }
}
