import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  IsUrl,
  Length,
  ValidateIf,
} from 'class-validator';

import { Rss } from '@rss/entity/rss.entity';
import { BLOG_PLATFORMS, BlogPlatform } from '@rss/util/blogUrlToRss';

export class RegisterRssRequestDto {
  @ApiProperty({
    example: 'seok3765.log',
    description: '블로그 이름을 입력해주세요.',
  })
  @IsString({
    message: '문자열로 입력해주세요.',
  })
  @IsNotEmpty({
    message: '블로그 이름이 없습니다.',
  })
  blogName: string;

  @ApiProperty({
    example: 'test',
    description: '실명을 입력해주세요.',
  })
  @Length(2, 50, { message: '이름 길이가 올바르지 않습니다.' })
  @IsString({
    message: '문자열로 입력해주세요.',
  })
  @IsNotEmpty({
    message: '실명이 없습니다.',
  })
  name: string;

  @ApiProperty({
    example: 'test@test.com',
    description: '이메일을 입력해주세요.',
  })
  @IsEmail(
    {},
    {
      message: '이메일 주소 형식에 맞춰서 작성해주세요.',
    },
  )
  email: string;

  @ApiProperty({
    example: 'https://test.tistory.com',
    description: '블로그 원본 주소를 입력해주세요.',
  })
  @IsUrl(
    {
      require_protocol: true,
      protocols: ['http', 'https'],
    },
    {
      message: 'http, https 프로토콜과 URL 형식을 맞춰주세요.',
    },
  )
  blogUrl: string;

  @ApiProperty({
    example: 'tistory',
    description: '블로그 플랫폼을 입력해주세요.',
    enum: BLOG_PLATFORMS,
  })
  @IsIn(BLOG_PLATFORMS, {
    message: `블로그 플랫폼은 ${BLOG_PLATFORMS.join(', ')} 중 하나여야 합니다.`,
  })
  blogPlatform: BlogPlatform;

  @ApiPropertyOptional({
    example: 'https://test.com/rss',
    description: '기타 플랫폼일 경우 RSS 주소를 직접 입력해주세요.',
  })
  @ValidateIf((dto: RegisterRssRequestDto) => dto.blogPlatform === 'etc')
  @IsUrl(
    {
      require_protocol: true,
      protocols: ['http', 'https'],
    },
    {
      message: 'http, https 프로토콜과 URL 형식을 맞춰주세요.',
    },
  )
  rssUrl?: string;

  constructor(partial: Partial<RegisterRssRequestDto>) {
    Object.assign(this, partial);
  }

  toEntity(rssUrl: string) {
    const rss = new Rss();
    rss.name = this.blogName;
    rss.userName = this.name;
    rss.email = this.email;
    rss.blogUrl = this.blogUrl;
    rss.blogPlatform = this.blogPlatform;
    rss.rssUrl = rssUrl;
    return rss;
  }
}
