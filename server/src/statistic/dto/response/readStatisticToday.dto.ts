import { ApiProperty } from '@nestjs/swagger';
import { Feed } from '../../../feed/entity/feed.entity';

export class ReadStatisticTodayResponseDto {
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
    description: '금일 게시글 조회수',
  })
  viewCount: number;

  private constructor(partial: Partial<ReadStatisticTodayResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(todayViewCount: Partial<Feed>) {
    return new ReadStatisticTodayResponseDto({
      id: todayViewCount.id,
      title: todayViewCount.title,
      viewCount: todayViewCount.viewCount,
    });
  }

  static toResponseDtoArray(todayViewCountList: Partial<Feed>[]) {
    return todayViewCountList.map((todayViewCount) =>
      this.toResponseDto(todayViewCount),
    );
  }
}
