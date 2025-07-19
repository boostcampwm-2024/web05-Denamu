import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class RequestDeleteRssDto {
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

  constructor(partial: Partial<RequestDeleteRssDto>) {
    Object.assign(this, partial);
  }
}
