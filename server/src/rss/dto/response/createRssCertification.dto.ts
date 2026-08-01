import { ApiProperty } from '@nestjs/swagger';

import { RssAccept } from '@rss/entity/rss.entity';

export class CreateRssCertificationResponseDto {
  @ApiProperty({
    example: 'velog',
    description: '인증 요청한 블로그의 플랫폼 종류',
  })
  blogPlatform: string;

  @ApiProperty({
    example: 'example_user',
    description: '인증 요청한 블로그에 등록된 신청자 이름',
  })
  userName: string;

  @ApiProperty({
    example: false,
    description:
      '인증 완료 여부. true면 이메일이 일치하여 즉시 인증이 완료된 것이고, false면 이메일로 발송된 코드로 2차 인증이 필요합니다.',
  })
  certified: boolean;

  constructor(partial: Partial<CreateRssCertificationResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(rssAccept: RssAccept, certified: boolean) {
    return new CreateRssCertificationResponseDto({
      blogPlatform: rssAccept.blogPlatform,
      userName: rssAccept.userName,
      certified,
    });
  }
}
