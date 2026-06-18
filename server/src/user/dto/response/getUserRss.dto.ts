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

  constructor(partial: Partial<GetUserRssResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(rssAccept: RssAccept) {
    return new GetUserRssResponseDto({
      id: rssAccept.id,
      name: rssAccept.name,
      userName: rssAccept.userName,
      rssUrl: rssAccept.rssUrl,
      blogPlatform: rssAccept.blogPlatform,
    });
  }

  static toResponseDtoArray(rssAcceptList: RssAccept[]) {
    return rssAcceptList.map((rssAccept) => this.toResponseDto(rssAccept));
  }
}
