import { ApiProperty } from '@nestjs/swagger';

import { RssBlock } from '@block/entity/rssBlock.entity';

export class GetBlockedRssResponseDto {
  @ApiProperty({
    example: {
      id: 1,
      name: 'seok3765.log',
      blogPlatform: 'velog',
      blogImage: null,
    },
    description: '차단된 RSS 정보',
  })
  rss: {
    id: number;
    name: string;
    blogPlatform: string;
    blogImage: string | null;
  };

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
          rss: {
            id: rssBlock.blockedRss.id,
            name: rssBlock.blockedRss.name,
            blogPlatform: rssBlock.blockedRss.blogPlatform,
            blogImage: rssBlock.blockedRss.blogImage ?? null,
          },
          blockedAt: rssBlock.createdAt,
        }),
    );
  }
}
