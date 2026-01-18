import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsUrl } from 'class-validator';

export class DeleteRssRequestDto {
  @ApiProperty({
    example: 'https://example.com',
    description: '블로그 주소를 입력해주세요.',
  })
  @IsUrl({}, { message: '유효한 URL을 입력해주세요.' })
  blogUrl: string;

  @ApiProperty({
    example: 'example@example.com',
    description: '이메일 주소를 입력해주세요.',
  })
  @IsEmail({}, { message: '올바른 이메일 주소를 입력하세요.' })
  email: string;

  constructor(partial: Partial<DeleteRssRequestDto>) {
    Object.assign(this, partial);
  }
}
