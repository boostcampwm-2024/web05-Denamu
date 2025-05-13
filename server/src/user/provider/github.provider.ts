import { BadGatewayException, Injectable } from '@nestjs/common';
import { OAuthProvider } from './oauth-provider.interface';
import {
  OAUTH_CONSTANT,
  OAUTH_URL_PATH,
  OAuthTokenResponse,
  UserInfo,
} from '../constant/oauth.constant';
import * as querystring from 'node:querystring';
import axios from 'axios';
import { WinstonLoggerService } from '../../common/logger/logger.service';

@Injectable()
export class GithubOAuthProvider implements OAuthProvider {
  constructor(private readonly logger: WinstonLoggerService) {}

  getAuthUrl() {
    const stateData = {
      provider: OAUTH_CONSTANT.PROVIDER_TYPE.GITHUB,
    };

    const state = Buffer.from(JSON.stringify(stateData)).toString('base64');

    const options = {
      redirect_uri: `${OAUTH_URL_PATH.BASE_URL}/${OAUTH_URL_PATH.REDIRECT_PATH.CALLBACK}`,
      client_id: process.env.GITHUB_CLIENT_ID,
      scope: ['user:email', 'read:user'].join(','),
      state: state,
    };

    return `${OAUTH_URL_PATH.GITHUB.AUTH_URL}?${querystring.stringify(options)}`;
  }

  // state의 검증 + code를 사용한 UserResource에 대한 AccessToken 반환
  async getTokens(code: string): Promise<OAuthTokenResponse> {
    const tokenUrl = OAUTH_URL_PATH.GITHUB.TOKEN_URL;

    const queries = {
      code,
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
    };

    try {
      const response = await axios.post(
        tokenUrl,
        querystring.stringify(queries),
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );

      const {
        access_token: access_token,
        refresh_token: refresh_token,
        expires_in: expires_in,
        scope: scope,
      } = response.data as OAuthTokenResponse;

      return {
        access_token,
        refresh_token,
        expires_in,
        scope,
      };
    } catch (error) {
      this.logger.error(`Oauth 로그인 중 에러 발생, ${error}`);
      throw new BadGatewayException(
        '현재 외부 서비스와의 연결에 실패했습니다.',
      );
    }
  }

  async getUserInfo(tokenResponse: OAuthTokenResponse): Promise<UserInfo> {
    const { access_token: accessToken } = tokenResponse;

    try {
      const response = await axios.get(
        `${OAUTH_URL_PATH.GITHUB.USER_INFO_URL}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const { id, email, name, avatar_url } = response.data as any;
      return {
        id,
        email,
        name,
        picture: avatar_url,
      } as UserInfo;
    } catch (error) {
      throw new BadGatewayException(
        '현재 외부 서비스와의 연결에 실패했습니다.',
      );
    }
  }
}
