import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CertificateDto {
  @ApiProperty({
    example: 'd2ba0d98-95ce-4905-87fc-384965ffe7c9',
    description: '인증 코드를 입력해주세요.',
  })
  @IsNotEmpty({
    message: '인증 코드를 입력해주세요.',
  })
  uuid: string;
}
