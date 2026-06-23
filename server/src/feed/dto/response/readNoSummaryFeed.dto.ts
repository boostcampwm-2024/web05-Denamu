import { ApiProperty } from '@nestjs/swagger';

import { Feed } from '@feed/entity/feed.entity';

export class ReadNoSummaryFeedResponseDto {
  @ApiProperty({ example: 1, description: '게시글 ID' })
  id: number;

  @ApiProperty({ example: 'example title', description: '게시글 제목' })
  title: string;

  @ApiProperty({ example: 0, description: '좋아요 수' })
  likes: number;

  @ApiProperty({ example: 0, description: '댓글 수' })
  comments: number;

  constructor(partial: Partial<ReadNoSummaryFeedResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(feed: Feed) {
    return new ReadNoSummaryFeedResponseDto({
      id: feed.id,
      title: feed.title,
      likes: feed.likeCount,
      comments: feed.commentCount,
    });
  }

  static toResponseDtoArray(feeds: Feed[]) {
    return feeds.map((feed) => this.toResponseDto(feed));
  }
}
