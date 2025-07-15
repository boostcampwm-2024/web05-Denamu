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
    example: 'example user name',
    description: '사용자 이름을 입력해주세요.',
  })
  @IsNotEmpty({ message: '유저 이름은 반드시 입력해야 합니다.' })
  @IsString({ message: '문자열로 입력해주세요.' })
  userName: string;

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
