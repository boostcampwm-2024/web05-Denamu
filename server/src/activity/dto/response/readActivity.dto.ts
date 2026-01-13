import { ApiProperty } from '@nestjs/swagger';
import { User } from '@user/entity/user.entity';

export class DailyActivityDto {
  date: string;
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

  private constructor(partial: Partial<ReadActivityResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(dailyActivities: DailyActivityDto[], user: User) {
    return new ReadActivityResponseDto({
      dailyActivities: dailyActivities,
      maxStreak: user.maxStreak,
      currentStreak: user.currentStreak,
      totalViews: user.totalViews,
    });
  }
}
