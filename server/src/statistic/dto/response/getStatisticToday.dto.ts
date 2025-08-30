import { ApiProperty } from '@nestjs/swagger';
import { Feed } from '../../../feed/entity/feed.entity';

export class GetStatisticTodayResponseDto {
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

  private constructor(partial: Partial<GetStatisticTodayResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(todayViewCount: Partial<Feed>) {
    return new GetStatisticTodayResponseDto({
      id: todayViewCount.id,
      title: todayViewCount.title,
      viewCount: todayViewCount.viewCount,
    });
  }

  static toResponseDtoArray(todayViewCountList: Partial<Feed>[]) {
    return todayViewCountList.map(this.toResponseDto);
  }
}
