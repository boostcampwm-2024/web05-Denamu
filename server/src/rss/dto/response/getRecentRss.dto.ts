import { ApiProperty } from '@nestjs/swagger';

export class GetRecentRssResponseDto {
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
    example: 'velog',
    description: 'RSS 블로그 플랫폼 종류',
  })
  blogPlatform: string;

  @ApiProperty({
    example: '2025-01-01T00:00:00.000Z',
    description: '가장 최근 공개 게시글의 발행 일자',
  })
  lastPublishedAt: Date;

  @ApiProperty({
    example: 10,
    description: '가장 최근 공개 게시글의 Feed ID',
  })
  latestFeedId: number;

  @ApiProperty({
    example: 'https://example.com/profile.png',
    description: 'RSS 채널 프로필 이미지 URL',
    nullable: true,
  })
  image: string | null;

  constructor(partial: Partial<GetRecentRssResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(row: {
    id: number;
    name: string;
    blogPlatform: string;
    image: string | null;
    lastPublishedAt: Date;
    latestFeedId: string;
  }) {
    return new GetRecentRssResponseDto({
      id: row.id,
      name: row.name,
      blogPlatform: row.blogPlatform,
      lastPublishedAt: row.lastPublishedAt,
      latestFeedId: Number(row.latestFeedId),
      image: row.image ?? null,
    });
  }
}
