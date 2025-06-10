import { ApiProperty } from '@nestjs/swagger';

export class DailyActivityDto {
  @ApiProperty({
    example: '2024-01-15',
    description: '활동 날짜 (YYYY-MM-DD)',
  })
  date: string;

  @ApiProperty({
    example: 5,
    description: '해당 날짜의 조회수',
  })
  viewCount: number;

  constructor(partial: Partial<DailyActivityDto>) {
    Object.assign(this, partial);
  }
}

export class ActivityReadResponseDto {
  @ApiProperty({
    type: [DailyActivityDto],
    description: '연도별 일별 활동 데이터 배열',
  })
  dailyActivities: DailyActivityDto[];

  @ApiProperty({
    example: 15,
    description: '사용자의 최장 읽기 스트릭',
  })
  maxStreak: number;

  @ApiProperty({
    example: 7,
    description: '사용자의 현재 읽기 스트릭',
  })
  currentStreak: number;

  @ApiProperty({
    example: 120,
    description: '사용자의 총 읽기 횟수',
  })
  totalViews: number;

  constructor(partial: Partial<ActivityReadResponseDto>) {
    Object.assign(this, partial);
  }
}
