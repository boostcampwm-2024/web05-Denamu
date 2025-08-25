import { ApiProperty } from '@nestjs/swagger';
import { Feed } from '../../../feed/entity/feed.entity';

export class StatisticAllResponseDto {
  @ApiProperty({
    example: 1,
    description: '게시글 ID',
  })
  id: number;

  @ApiProperty({
    example: 'example title',
    description: '게시글 제목',
  })
  title: string;

  @ApiProperty({
    example: 1,
    description: '전체 게시글 조회수',
  })
  viewCount: number;

  private constructor(partial: Partial<StatisticAllResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(feed: Feed) {
    return new StatisticAllResponseDto({
      id: feed.id,
      title: feed.title,
      viewCount: feed.viewCount,
    });
  }

  static toResponseDtoArray(feeds: Feed[]) {
    return feeds.map(this.toResponseDto);
  }
}
