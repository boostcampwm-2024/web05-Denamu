import { BadGatewayException, Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import * as querystring from 'node:querystring';
import axios from 'axios';
import { ProviderRepository } from '../repository/provider.repository';
import { WinstonLoggerService } from '../../common/logger/logger.service';
import { Request } from 'express';
import { User } from '../entity/user.entity';
import { Provider } from '../entity/provider.entity';

const OAUTH_URL_PATH = {
  GOOGLE: {
    AUTH_URL: `https://accounts.google.com/o/oauth2/v2/auth`,
    TOKEN_URL: `https://oauth2.googleapis.com/token`,
    USER_INFO_URL: `https://www.googleapis.com/oauth2/v1/userinfo`,
  },
  REDIRECT_PATH: {
    CALLBACK: `api/oauth/callback`,
  },
  BASE_URL: `https://denamu.site`,
};

const OAUTH_CONSTANT = {
  PROVIDER_TYPE: {
    GOOGLE: `google`,
  },
};

type OAuthTokenResponse = {
  id_token: string;
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
};

type UserInfo = {
  id: string;
  email: string;
  name: string;
  picture?: string;
};

type ProviderData = {
  providerType: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
};

type StateData = {
  provider: string;
};

@Injectable()
export class OAuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly providerRepository: ProviderRepository,
    private readonly logger: WinstonLoggerService,
  ) {}

  getGoogleAuthUrl() {
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

  async callback(req: Request) {
    const { code, state } = req.query;
    const stateData = this.parseStateData(state.toString());
    const { provider: providerType } = stateData;

    const tokenData = await this.getTokens({
      code,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: `${OAUTH_URL_PATH.BASE_URL}/${OAUTH_URL_PATH.REDIRECT_PATH.CALLBACK}`,
    });

    if (providerType === OAUTH_CONSTANT.PROVIDER_TYPE.GOOGLE) {
      await this.handleGoogleOAuth(tokenData);
    }

    return `${OAUTH_URL_PATH.BASE_URL}`;
  }

  private parseStateData(stateString: string): StateData {
    try {
      return JSON.parse(Buffer.from(stateString, 'base64').toString());
    } catch (error) {
      throw new BadGatewayException(
        '현재 외부 서비스와의 연결에 실패했습니다.',
      );
    }
  }

  private async getTokens({ code, clientId, clientSecret, redirectUri }) {
    const tokenUrl = OAUTH_URL_PATH.GOOGLE.TOKEN_URL;
    const values = {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
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

      return response.data;
    } catch (error) {
      throw new BadGatewayException(
        '현재 외부 서비스와의 연결에 실패했습니다.',
      );
    }
  }

  private async handleGoogleOAuth(tokenData: OAuthTokenResponse) {
    const {
      id_token: idToken,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
    } = tokenData;

    const googleUserInfo = await this.getGoogleUserInfo(idToken, accessToken);

    await this.saveGoogleUser(googleUserInfo, {
      providerType: OAUTH_CONSTANT.PROVIDER_TYPE.GOOGLE,
      accessToken,
      refreshToken,
      expiresIn,
    });
  }

  private async getGoogleUserInfo(idToken: string, accessToken: string) {
    try {
      const response = await axios.get(
        `${OAUTH_URL_PATH.GOOGLE.USER_INFO_URL}?alt=json&access_token=${accessToken}`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new BadGatewayException(
        '현재 외부 서비스와의 연결에 실패했습니다.',
      );
    }
  }

  private async saveGoogleUser(
    googleUserInfo: UserInfo,
    providerData: ProviderData,
  ) {
    const { providerType, accessToken, refreshToken, expiresIn } = providerData;
    const existingProvider = await this.findExistingProvider(
      providerType,
      googleUserInfo.id,
    );

    if (existingProvider) {
      await this.updateProviderTokens(
        existingProvider,
        accessToken,
        refreshToken,
        expiresIn,
      );
      return;
    }
    const user = await this.findOrCreateUser(googleUserInfo, providerType);
    await this.createProvider(
      providerType,
      googleUserInfo.id,
      accessToken,
      refreshToken,
      expiresIn,
      user,
    );
  }

  private async findExistingProvider(
    providerType: string,
    providerUserId: string,
  ) {
    return await this.providerRepository.findByProviderTypeAndId(
      providerType,
      providerUserId,
    );
  }

  private async updateProviderTokens(
    provider: Provider,
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
  ) {
    provider.accessToken = accessToken;

    if (refreshToken) {
      provider.refreshToken = refreshToken;
    }

    if (expiresIn) {
      const accessTokenExpiresAt = new Date();
      accessTokenExpiresAt.setSeconds(
        accessTokenExpiresAt.getSeconds() + expiresIn,
      );
      provider.accessTokenExpiresAt = accessTokenExpiresAt;
    }
    await this.providerRepository.save(provider);
    this.logger.log(
      `기존 사용자 인증 정보 업데이트 완료: ${provider.user.email}`,
    );
  }

  //User Entity
  private async findOrCreateUser(userInfo: UserInfo, providerType: string) {
    let user = await this.userRepository.findOne({
      where: { email: userInfo.email },
    });

    if (!user) {
      user = await this.userRepository.save({
        email: userInfo.email,
        userName: userInfo.name,
        profileImage: userInfo.picture || null,
        provider: providerType,
      });
      this.logger.log(`새로운 사용자 가입 완료: ${userInfo.email}`);
    }

    return user;
  }

  //Provider Entity
  private async createProvider(
    providerType: string,
    providerUserId: string,
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    user: User,
  ) {
    const accessTokenExpiresAt = new Date();
    if (expiresIn) {
      accessTokenExpiresAt.setSeconds(
        accessTokenExpiresAt.getSeconds() + expiresIn,
      );
    }

    await this.providerRepository.save({
      providerType,
      providerUserId,
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      user,
    });

    this.logger.log(
      `새로운 사용자 인증 정보 저장 완료: ${providerType} ${user.email}`,
    );
  }
}
