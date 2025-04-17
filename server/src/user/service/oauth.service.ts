import { BadGatewayException, Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import * as querystring from 'node:querystring';
import axios from 'axios';
import { ProviderRepository } from '../repository/provider.repository';
import { WinstonLoggerService } from '../../common/logger/logger.service';
import { Request } from 'express';

const OAUTH_CONSTANTS = {
  GOOGLE: {
    AUTH_URL: `https://accounts.google.com/o/oauth2/v2/auth`,
    TOKEN_URL: `https://oauth2.googleapis.com/token`,
    USER_INFO_URL: `https://www.googleapis.com/oauth2/v1/userinfo`,
  },
  REDIRECT_PATH: {
    CALLBACK: `api/oauth/callback`,
  },
  HOME: `https://denamu.site`,
};

@Injectable()
export class OAuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly providerRepository: ProviderRepository,
    private readonly logger: WinstonLoggerService,
  ) {}

  getGoogleAuthUrl() {
    const googleOAuthUrl = OAUTH_CONSTANTS.GOOGLE.AUTH_URL;

    const stateData = {
      provider: 'google',
      timestamp: Date.now(),
    };

    const state = Buffer.from(JSON.stringify(stateData)).toString('base64');

    const options = {
      redirect_uri: `${OAUTH_CONSTANTS.HOME}/${OAUTH_CONSTANTS.REDIRECT_PATH.CALLBACK}`,
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
    const { provider: providerType } = JSON.parse(
      Buffer.from(state, 'base64').toString(),
    );

    const tokenData = await this.getTokens({
      code,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: `${OAUTH_CONSTANTS.HOME}/${OAUTH_CONSTANTS.REDIRECT_PATH.CALLBACK}`,
    });

    const {
      id_token: idToken,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
    } = tokenData;

    if (providerType === 'google') {
      const googleUser = await this.getGoogleUser(idToken, accessToken);
      await this.saveGoogleUser(googleUser, {
        providerType,
        accessToken,
        refreshToken,
        expiresIn,
      });
    }

    return `${OAUTH_CONSTANTS.HOME}`;
  }

  private async getTokens({ code, clientId, clientSecret, redirectUri }) {
    const tokenUrl = OAUTH_CONSTANTS.GOOGLE.TOKEN_URL;
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

  private async getGoogleUser(idToken: string, accessToken: string) {
    try {
      const response = await axios.get(
        `${OAUTH_CONSTANTS.GOOGLE.USER_INFO_URL}?alt=json&access_token=${accessToken}`,
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

  private async saveGoogleUser(googleUser, providerData) {
    const { providerType, accessToken, refreshToken, expiresIn } = providerData;
    const existingProvider =
      await this.providerRepository.findByProviderTypeAndId(
        providerType,
        googleUser.id,
      );

    if (existingProvider) {
      existingProvider.accessToken = accessToken;
      if (refreshToken) {
        existingProvider.refreshToken = refreshToken;
      }

      if (expiresIn) {
        const accessTokenExpiresAt = new Date();
        accessTokenExpiresAt.setSeconds(
          accessTokenExpiresAt.getSeconds() + expiresIn,
        );
        existingProvider.accessTokenExpiresAt = accessTokenExpiresAt;
      }
      await this.providerRepository.save(existingProvider);
      this.logger.log(
        `기존 사용자 인증 정보 업데이트 완료: ${existingProvider.user.email}`,
      );
      return;
    }

    let user = await this.userRepository.findOne({
      where: { email: googleUser.email },
    });

    if (!user) {
      user = await this.userRepository.save({
        email: googleUser.email,
        userName: googleUser.name,
        profileImage: googleUser.picture,
        provider: providerType,
      });
      this.logger.log(`새로운 사용자 가입 완료: ${googleUser.email}`);
    }

    const accessTokenExpiresAt = new Date();
    if (expiresIn) {
      accessTokenExpiresAt.setSeconds(
        accessTokenExpiresAt.getSeconds() + expiresIn,
      );
    }

    await this.providerRepository.save({
      providerType,
      providerUserId: googleUser.id,
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
