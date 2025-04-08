import { BadGatewayException, Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import * as querystring from 'node:querystring';
import axios from 'axios';
import { ProviderRepository } from '../repository/provider.repository';
import { WinstonLoggerService } from '../../common/logger/logger.service';

@Injectable()
export class OAuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly providerRepository: ProviderRepository,
    private readonly logger: WinstonLoggerService,
  ) {}

  getGoogleAuthUrl() {
    const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth`;

    const stateData = {
      provider: 'google',
      timestamp: Date.now(),
    };

    const state = Buffer.from(JSON.stringify(stateData)).toString('base64');

    const options = {
      redirect_uri: `http://localhost:8080/api/oauth/callback`,
      client_id: process.env.GOOGLE_CLIENT_ID,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: ['email', 'profile'].join(' '),
      state: state,
    };

    return `${googleOAuthUrl}?${querystring.stringify(options)}`;
  }

  async callback(req) {
    const { code, state } = req.query;
    const { provider: providerType, timestamp } = JSON.parse(
      Buffer.from(state, 'base64').toString(),
    );

    const tokenData = await this.getTokens({
      code,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: `http://localhost:8080/api/oauth/callback`,
    });

    const {
      id_token: idToken,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
    } = tokenData;

    const googleUser = await this.getGoogleUser(idToken, accessToken);
    const user = await this.saveGoogleUser(googleUser, {
      providerType,
      accessToken,
      refreshToken,
      expiresIn,
    });

    return 'http://localhost:5173';
  }

  private async getTokens({ code, clientId, clientSecret, redirectUri }) {
    const url = 'https://oauth2.googleapis.com/token';
    const values = {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    };

    try {
      const response = await axios.post(url, querystring.stringify(values), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

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
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`,
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

    console.log(JSON.stringify(googleUser));

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
        '기존 사용자 인증 정보 업데이트 완료:',
        existingProvider.user.email,
      );
      return existingProvider.user;
    }
    const user = await this.userRepository.findOne({
      where: { email: googleUser.email },
    });

    if (!user) {
      await this.userRepository.save({
        email: googleUser.email,
        userName: googleUser.name,
        profileImage: googleUser.picture,
        provider: providerType,
      });
      this.logger.log('새로운 사용자 가입 완료:', user.email);
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
      '새로운 사용자 인증 정보 저장 완료:',
      providerType + ' ' + user.email,
    );
  }
}
