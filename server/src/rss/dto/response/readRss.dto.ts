import { ApiProperty } from '@nestjs/swagger';

import { Rss } from '@rss/entity/rss.entity';

export class ReadRssResponseDto {
  @ApiProperty({
    example: 1,
    description: 'RSS 대기 ID',
  })
  id: number;

  @ApiProperty({
    example: 'example blog name',
    description: 'RSS 블로그 이름',
  })
  name: string;

  @ApiProperty({
    example: 'example user name',
    description: '신청자 이름',
  })
  userName: string;

  @ApiProperty({
    example: 'example@email.com',
    description: 'RSS 신청 이메일',
  })
  email: string;

  @ApiProperty({
    example: 'https://example.com/rssUrl',
    description: 'RSS URL',
  })
  rssUrl: string;

  @ApiProperty({
    example: 'velog',
    description: 'RSS URL로부터 추정한 블로그 플랫폼 종류',
  })
  blogPlatform: string;

  @ApiProperty({
    example: 'https://example.com/profile.png',
    description: 'RSS 채널 프로필 이미지 URL',
    nullable: true,
  })
  blogImage: string | null;

  constructor(partial: Partial<ReadRssResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(rss: Rss) {
    return new ReadRssResponseDto({
      id: rss.id,
      name: rss.name,
      userName: rss.userName,
      email: rss.email,
      rssUrl: rss.rssUrl,
      blogPlatform: rss.blogPlatform,
      blogImage: rss.blogImage ?? null,
    });
  }

  static toResponseDtoArray(rssList: Rss[]) {
    return rssList.map((rss) => this.toResponseDto(rss));
  }
}
