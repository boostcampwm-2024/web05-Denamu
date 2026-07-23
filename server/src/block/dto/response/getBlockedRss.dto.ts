import { ApiProperty } from '@nestjs/swagger';

import { RssBlock } from '@block/entity/rssBlock.entity';

export class GetBlockedRssResponseDto {
  @ApiProperty({
    example: 1,
    description: '차단된 RSS(rss_accept) ID',
  })
  rssId: number;

  @ApiProperty({
    example: 'seok3765.log',
    description: '차단된 RSS 블로그 이름',
  })
  name: string;

  @ApiProperty({
    example: 'velog',
    description: '차단된 RSS 블로그 플랫폼 종류',
  })
  blogPlatform: string;

  @ApiProperty({
    example: '2025-08-16T12:00:00.000Z',
    description: '차단 일시',
  })
  blockedAt: Date;

  constructor(partial: Partial<GetBlockedRssResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDtoArray(rssBlocks: RssBlock[]) {
    return rssBlocks.map(
      (rssBlock) =>
        new GetBlockedRssResponseDto({
          rssId: rssBlock.blockedRss.id,
          name: rssBlock.blockedRss.name,
          blogPlatform: rssBlock.blockedRss.blogPlatform,
          blockedAt: rssBlock.createdAt,
        }),
    );
  }
}
