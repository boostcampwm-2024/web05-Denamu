import { ApiProperty } from '@nestjs/swagger';
import { RssAccept } from '../../../rss/entity/rss.entity';

export class GetStatisticPlatformResponseDto {
  @ApiProperty({
    example: 'example blog platform',
    description: '블로그 플랫폼',
  })
  platform: string;

  @ApiProperty({
    example: 1,
    description: '게시글 조회수',
  })
  count: number;

  private constructor(partial: Partial<GetStatisticPlatformResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(platformStatistic: RssAccept) {
    return new GetStatisticPlatformResponseDto({
      platform: platformStatistic['platform'],
      count: platformStatistic['count'],
    });
  }

  static toResponseDtoArray(platformStatistics: RssAccept[]) {
    return platformStatistics.map((platformStatistic: RssAccept) => {
      platformStatistic['count'] = parseInt(platformStatistic['count']);
      return this.toResponseDto(platformStatistic);
    });
  }
}
