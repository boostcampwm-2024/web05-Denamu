import { ApiProperty } from '@nestjs/swagger';

import { RssAccept } from '@rss/entity/rss.entity';

export class PreviewRssCertificationResponseDto {
  @ApiProperty({
    example: 'seok3765.log',
    description: '인증 요청한 블로그 이름',
  })
  name: string;

  @ApiProperty({
    example: 'example_user',
    description: '인증 요청한 블로그에 등록된 신청자 이름',
  })
  userName: string;

  @ApiProperty({
    example: 'https://v2.velog.io/rss/@seok3765',
    description: '인증 요청한 블로그의 RSS URL',
  })
  rssUrl: string;

  @ApiProperty({
    example: 'velog',
    description: '인증 요청한 블로그의 플랫폼 종류',
  })
  blogPlatform: string;

  @ApiProperty({
    example: false,
    description:
      '2차 이메일 인증 필요 여부. false면 RSS 등록 이메일과 로그인 이메일이 일치하여 즉시 인증되고, true면 RSS 등록 이메일로 발송되는 코드로 추가 인증이 필요합니다.',
  })
  requiresEmailVerification: boolean;

  constructor(partial: Partial<PreviewRssCertificationResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(
    rssAccept: RssAccept,
    requiresEmailVerification: boolean,
  ) {
    return new PreviewRssCertificationResponseDto({
      name: rssAccept.name,
      userName: rssAccept.userName,
      rssUrl: rssAccept.rssUrl,
      blogPlatform: rssAccept.blogPlatform,
      requiresEmailVerification,
    });
  }
}
