import { ApiProperty } from '@nestjs/swagger';

export class OAuthCallbackRequestDto {
  @ApiProperty({
    example: 'testCode',
    description: 'Access Token 갱신 토큰',
  })
  code: string;

  @ApiProperty({
    example: '{ provider: {플랫폼 종류}}',
    description: 'OAuth 서버와의 상태 유지 사용 값 base64 인코딩(데나무)',
  })
  state: string;

  constructor(partial: Partial<OAuthCallbackRequestDto>) {
    Object.assign(this, partial);
  }
}
