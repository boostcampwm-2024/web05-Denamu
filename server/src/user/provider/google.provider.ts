import { OAuthProvider } from './oauth-provider.interface';
import * as querystring from 'node:querystring';
import { BadGatewayException, Injectable } from '@nestjs/common';
import {
  OAUTH_CONSTANT,
  OAUTH_URL_PATH,
  OAuthTokenResponse,
  UserInfo,
} from '../constant/oauth.constant';
import axios from 'axios';

@Injectable()
export class GoogleOAuthProvider implements OAuthProvider {
  getAuthUrl() {
    const googleOAuthUrl = OAUTH_URL_PATH.GOOGLE.AUTH_URL;

    const stateData = {
      provider: OAUTH_CONSTANT.PROVIDER_TYPE.GOOGLE,
    };

    const state = Buffer.from(JSON.stringify(stateData)).toString('base64');

    const options = {
      redirect_uri: `${OAUTH_URL_PATH.BASE_URL}/${OAUTH_URL_PATH.REDIRECT_PATH.CALLBACK}`,
      client_id: process.env.GOOGLE_CLIENT_ID,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: ['email', 'profile'].join(' '),
      state: state,
    };

    return `${googleOAuthUrl}?${querystring.stringify(options)}`;
  }

  async getTokens(code: string) {
    const tokenUrl = OAUTH_URL_PATH.GOOGLE.TOKEN_URL;
    const values = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${OAUTH_URL_PATH.BASE_URL}/${OAUTH_URL_PATH.REDIRECT_PATH.CALLBACK}`,
      grant_type: 'authorization_code',
    };

    try {
      const response = await axios.post(
        tokenUrl,
        querystring.stringify(values),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const {
        id_token: id_token,
        access_token: access_token,
        expires_in: expires_in,
      } = response.data as OAuthTokenResponse;

      return {
        id_token,
        access_token,
        expires_in,
      };
    } catch (error) {
      throw new BadGatewayException(
        '현재 외부 서비스와의 연결에 실패했습니다.',
      );
    }
  }

  async getUserInfo(tokenResponse: OAuthTokenResponse) {
    const { id_token: idToken, access_token: accessToken } = tokenResponse;

    try {
      const response = await axios.get(
        `${OAUTH_URL_PATH.GOOGLE.USER_INFO_URL}?alt=json&access_token=${accessToken}`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        },
      );

      const { id, email, name, picture } = response.data;
      return {
        id,
        email,
        name,
        picture,
      } as UserInfo;
    } catch (error) {
      throw new BadGatewayException(
        '현재 외부 서비스와의 연결에 실패했습니다.',
      );
    }
  }
}
