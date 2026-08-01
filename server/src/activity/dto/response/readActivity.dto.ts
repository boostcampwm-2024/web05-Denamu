import { ApiProperty } from '@nestjs/swagger';

export class DailyActivityDto {
  @ApiProperty({ example: '2024-01-15', description: '활동 날짜 (YYYY-MM-DD)' })
  date: string;

  @ApiProperty({ example: 5, description: '해당 날짜의 조회수' })
  viewCount: number;

  constructor(partial: Partial<DailyActivityDto>) {
    Object.assign(this, partial);
  }
}

export class ReadActivityResponseDto {
  @ApiProperty({
    type: [DailyActivityDto],
    description: '연도별 일별 활동 데이터 배열',
  })
  dailyActivities: DailyActivityDto[];

  constructor(partial: Partial<ReadActivityResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(dailyActivities: DailyActivityDto[]) {
    return new ReadActivityResponseDto({
      dailyActivities: dailyActivities,
    });
  }
}
