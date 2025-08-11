import { ApiProperty } from '@nestjs/swagger';
import { RssAccept } from '../../entity/rss.entity';

export class RssAcceptHistoryResponseDto {
  @ApiProperty({
    example: 1,
    description: 'RSS 승인 ID',
  })
  id: number;

  @ApiProperty({
    example: 'example blog name',
    description: 'RSS 블로그 이름',
  })
  name: string;

  @ApiProperty({
    example: 'example user name',
    description: 'RSS 신청자 이름',
  })
  userName: string;

  @ApiProperty({
    example: 'example email',
    description: 'RSS 신청 이메일 주소',
  })
  email: string;

  @ApiProperty({
    example: 'example rss URL',
    description: '승인 RSS URL',
  })
  rssUrl: string;

  @ApiProperty({
    example: 'example blog platform',
    description: 'RSS 블로그 플랫폼 종류',
  })
  blogPlatform: string;

  private constructor(partial: Partial<RssAcceptHistoryResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(rssAccept: RssAccept) {
    return new RssAcceptHistoryResponseDto({
      id: rssAccept.id,
      name: rssAccept.name,
      userName: rssAccept.userName,
      email: rssAccept.email,
      rssUrl: rssAccept.rssUrl,
      blogPlatform: rssAccept.blogPlatform,
    });
  }

  static toResponseDtoArray(rssAcceptList: RssAccept[]) {
    return rssAcceptList.map(this.toResponseDto);
  }
}
