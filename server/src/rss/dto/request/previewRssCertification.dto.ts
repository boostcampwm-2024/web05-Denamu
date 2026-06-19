import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class PreviewRssCertificationRequestDto {
  @ApiProperty({
    description: '소유 인증할 블로그 이름을 입력해주세요.',
    example: 'seok3765.log',
  })
  @IsNotEmpty({
    message: '블로그 이름을 입력해주세요.',
  })
  @IsString({
    message: '문자열로 입력해주세요.',
  })
  blogName: string;

  constructor(partial: Partial<PreviewRssCertificationRequestDto>) {
    Object.assign(this, partial);
  }
}
