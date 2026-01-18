import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class OAuthCallbackRequestDto {
  @ApiProperty({
    example: 'testCode',
    description: 'Access Token 갱신 토큰',
  })
  @IsNotEmpty({
    message: 'code는 필수 입력 값입니다.',
  })
  @IsString({
    message: '문자열로 입력해주세요.',
  })
  code: string;

  @ApiProperty({
    example: '{ provider: {플랫폼 종류}}',
    description: 'OAuth 서버와의 상태 유지 사용 값 base64 인코딩(데나무)',
  })
  @IsNotEmpty({
    message: 'state는 필수 입력 값입니다.',
  })
  @IsString({
    message: '문자열로 입력해주세요.',
  })
  state: string;

  constructor(partial: Partial<OAuthCallbackRequestDto>) {
    Object.assign(this, partial);
  }
}
