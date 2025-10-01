import { OAuthType } from '../../constant/oauth.constant';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OAuthTypeRequestDto {
  @ApiProperty({
    example: OAuthType.Google,
    description: '제공자 타입',
  })
  @IsEnum(OAuthType, {
    message: '지원하지 않는 인증 제공자입니다.',
  })
  type: OAuthType;

  constructor(partial: Partial<OAuthTypeRequestDto>) {
    Object.assign(this, partial);
  }
}
