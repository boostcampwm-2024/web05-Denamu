import { OAuthType } from '../../constant/oauth.constant';
import { IsEnum } from 'class-validator';

export class OAuthTypeDto {
  @IsEnum(OAuthType, {
    message: '지원하지 않는 인증 제공자입니다.',
  })
  type: OAuthType;
}
