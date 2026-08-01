import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsEnum, IsOptional } from 'class-validator';

import { OAuthType } from '@user/constant/oauth.constant';

export class OAuthE2eCallbackQueryRequestDto {
  @ApiPropertyOptional({
    example: OAuthType.Google,
    description: '제공자 타입',
    default: OAuthType.Google,
  })
  @IsOptional()
  @IsEnum(OAuthType, {
    message: '지원하지 않는 인증 제공자입니다.',
  })
  provider: OAuthType = OAuthType.Google;

  constructor(partial: Partial<OAuthE2eCallbackQueryRequestDto>) {
    Object.assign(this, partial);
  }
}
