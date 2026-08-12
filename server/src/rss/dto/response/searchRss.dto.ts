import { ApiProperty } from '@nestjs/swagger';

import { RssAccept } from '@rss/entity/rss.entity';

export class SearchRssResult {
  @ApiProperty({ example: 1, description: 'RSS(rss_accept) ID' })
  id: number;

  @ApiProperty({ example: 'seok3765.log', description: 'RSS 블로그 이름' })
  name: string;

  @ApiProperty({ example: 'velog', description: 'RSS 블로그 플랫폼 종류' })
  blogPlatform: string;

  @ApiProperty({
    example: 'https://example.com/profile.png',
    description: 'RSS 채널 프로필 이미지 URL',
    nullable: true,
  })
  blogImage: string | null;

  @ApiProperty({ example: 12, description: '공개 게시글 개수' })
  feedCount: number;

  private constructor(partial: Partial<SearchRssResult>) {
    Object.assign(this, partial);
  }

  static toResultDto(rss: RssAccept, feedCount: number) {
    return new SearchRssResult({
      id: rss.id,
      name: rss.name,
      blogPlatform: rss.blogPlatform,
      blogImage: rss.blogImage ?? null,
      feedCount,
    });
  }

  static toResultDtoArray(
    rssList: RssAccept[],
    feedCountMap: Map<number, number>,
  ) {
    return rssList.map((rss) =>
      this.toResultDto(rss, feedCountMap.get(rss.id) ?? 0),
    );
  }
}

export class SearchRssResponseDto {
  @ApiProperty({
    example: 1,
    description: '전체 RSS 개수',
  })
  totalCount: number;

  @ApiProperty({ type: [SearchRssResult], description: '검색 결과 RSS' })
  result: SearchRssResult[];

  @ApiProperty({
    example: 10,
    description: '총 페이지 수',
  })
  totalPages: number;

  @ApiProperty({
    example: 5,
    description: '한 페이지 최대 RSS 개수',
  })
  limit: number;

  constructor(partial: Partial<SearchRssResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(
    totalCount: number,
    rssList: SearchRssResult[],
    totalPages: number,
    limit: number,
  ) {
    return new SearchRssResponseDto({
      totalCount,
      result: rssList,
      totalPages,
      limit,
    });
  }
}
