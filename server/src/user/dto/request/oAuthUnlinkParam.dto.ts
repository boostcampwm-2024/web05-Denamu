import { ApiProperty } from '@nestjs/swagger';

import { IsEnum } from 'class-validator';

import { OAuthType } from '@user/constant/oauth.constant';

export class OAuthUnlinkParamRequestDto {
  @ApiProperty({
    example: OAuthType.Google,
    description: '연결 해제할 제공자 타입',
  })
  @IsEnum(OAuthType, {
    message: '지원하지 않는 인증 제공자입니다.',
  })
  provider: OAuthType;

  constructor(partial: Partial<OAuthUnlinkParamRequestDto>) {
    Object.assign(this, partial);
  }
}
