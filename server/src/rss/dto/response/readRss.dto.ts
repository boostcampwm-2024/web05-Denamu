import { ApiProperty } from '@nestjs/swagger';
import { Rss } from '../../entity/rss.entity';

export class ReadRssResponseDto {
  @ApiProperty({
    example: 1,
    description: 'RSS 대기 ID',
  })
  id: number;

  @ApiProperty({
    example: 'example blog name',
    description: 'RSS 블로그 이름',
  })
  name: string;

  @ApiProperty({
    example: 'example user name',
    description: '신청자 이름',
  })
  userName: string;

  @ApiProperty({
    example: 'example@email.com',
    description: 'RSS 신청 이메일',
  })
  email: string;

  @ApiProperty({
    example: 'https://example.com/rssUrl',
    description: 'RSS URL',
  })
  rssUrl: string;

  private constructor(partial: Partial<ReadRssResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(rss: Rss) {
    return new ReadRssResponseDto({
      id: rss.id,
      name: rss.name,
      userName: rss.userName,
      email: rss.email,
      rssUrl: rss.rssUrl,
    });
  }

  static toResponseDtoArray(rssList: Rss[]) {
    return rssList.map(this.toResponseDto);
  }
}
