import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsUrl, Length } from 'class-validator';
import { RssInformation } from '../rss.entity';

export class RssRegisterDto {
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
  blog: string;

  @ApiProperty({
    example: 'J235_조민석',
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
    example: 'seok3765@naver.com',
    description: '이메일을 입력해주세요.',
  })
  @IsEmail(
    {},
    {
      message: '이메일 주소 형식에 맞춰서 작성해주세요.',
    },
  )
  @IsNotEmpty({
    message: '이메일이 없습니다.',
  })
  email: string;

  @ApiProperty({
    example: 'https://v2.velog.io/rss/@seok3765',
    description: 'RSS 주소를 입력해주세요.',
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
  @IsNotEmpty({
    message: 'RSS URL이 없습니다.',
  })
  rssUrl: string;

  constructor(partial: Partial<RssRegisterDto>) {
    Object.assign(this, partial);
  }

  static from(rss: RssInformation) {
    return new RssRegisterDto({
      blog: rss.name,
      name: rss.userName,
      email: rss.email,
      rssUrl: rss.rssUrl,
    });
  }
}
