import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteCertificateRssRequestDto {
  @ApiProperty({
    description: '이메일 인증 코드를 입력해주세요.',
    example: 'test code',
  })
  @IsNotEmpty({
    message: '인증 코드를 입력해주세요.',
  })
  @IsString({
    message: '문자열로 입력해주세요.',
  })
  code: string;

  constructor(partial: Partial<DeleteCertificateRssRequestDto>) {
    Object.assign(this, partial);
  }
}
