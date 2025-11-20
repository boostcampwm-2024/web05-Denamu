import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CertificateUserRequestDto {
  @ApiProperty({
    example: 'd2ba0d98-95ce-4905-87fc-384965ffe7c9',
    description: '인증 코드를 입력해주세요.',
  })
  @IsNotEmpty({
    message: '인증 코드를 입력해주세요.',
  })
  @IsString({
    message: '문자열로 입력해주세요.',
  })
  uuid: string;

  constructor(partial: Partial<CertificateUserRequestDto>) {
    Object.assign(this, partial);
  }
}
