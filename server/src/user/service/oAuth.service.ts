import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { Response } from 'express';
import { DataSource } from 'typeorm';

import { cookieConfig } from '@common/cookie/cookie.config';
import { Payload } from '@common/guard/jwt.guard';
import { WinstonLoggerService } from '@common/logger/logger.service';

import { OAuthType, StateData } from '@user/constant/oauth.constant';
import { REFRESH_TOKEN_TTL } from '@user/constant/user.constants';
import { OAuthCallbackRequestDto } from '@user/dto/request/oAuthCallbackDto';
import { Provider } from '@user/entity/provider.entity';
import { User } from '@user/entity/user.entity';
import { OAuthProvider } from '@user/provider/oauth-provider.interface';
import { ProviderRepository } from '@user/repository/provider.repository';
import { UserRepository } from '@user/repository/user.repository';
import { UserService } from '@user/service/user.service';

@Injectable()
export class OAuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly providerRepository: ProviderRepository,
    private readonly logger: WinstonLoggerService,
    private readonly userService: UserService,
    @Inject('OAUTH_PROVIDERS')
    private readonly providers: Record<string, OAuthProvider>,
    private readonly dataSource: DataSource,
  ) {}

  getAuthUrl(providerType: OAuthType) {
    return this.providers[providerType].getAuthUrl();
  }

  // TODO: OAuth CSRF 공격 방지를 위한 CSRF 토큰 추가 필요
  async callback(callbackDto: OAuthCallbackRequestDto, res: Response) {
    const stateData = this.parseStateData(callbackDto.state);
    const { provider: providerType } = stateData;

    const tokenData = await this.providers[providerType].getTokens(
      callbackDto.code,
    );

    const userInfo = await this.providers[providerType].getUserInfo(tokenData);

    await this.completeOAuthSignIn(
      {
        providerType,
        providerUserId: userInfo.id,
        email: userInfo.email,
        userName: userInfo.name,
        profileImage: userInfo.picture || null,
        providerRefreshToken: tokenData.refresh_token || null,
      },
      res,
    );
  }

  async e2eCallback(providerType: OAuthType, res: Response) {
    const normalizedProvider =
      providerType === OAuthType.Github ? OAuthType.Github : OAuthType.Google;

    await this.completeOAuthSignIn(
      {
        providerType: normalizedProvider,
        providerUserId: `e2e-${normalizedProvider}-provider-user`,
        email: `e2e-${normalizedProvider}@denamu.local`,
        userName: `e2e-${normalizedProvider}-user`,
        profileImage: null,
        providerRefreshToken: `e2e-${normalizedProvider}-provider-refresh-token`,
      },
      res,
    );
  }

  private async completeOAuthSignIn(
    payload: {
      providerType: string;
      providerUserId: string;
      email: string;
      userName: string;
      profileImage: string | null;
      providerRefreshToken: string | null;
    },
    res: Response,
  ) {
    const {
      providerType,
      providerUserId,
      email,
      userName,
      profileImage,
      providerRefreshToken,
    } = payload;

    const existingProvider = await this.findExistingProvider(
      providerType,
      providerUserId,
    );

    if (existingProvider) {
      await this.updateProviderTokens(existingProvider, providerRefreshToken);
    }

    let user = await this.userRepository.findOne({
      where: { email },
    });

    await this.dataSource.transaction(async (entityManager) => {
      try {
        if (!user) {
          user = await entityManager.save(User, {
            email,
            userName,
            profileImage,
            provider: providerType,
          });
          this.logger.log(`새로운 사용자 가입 완료: ${email}`);
        }

        if (!existingProvider) {
          await entityManager.save(Provider, {
            providerType,
            providerUserId,
            refreshToken: providerRefreshToken,
            user,
          });

          this.logger.log(
            `새로운 사용자 인증 정보 저장 완료: ${providerType} ${user.email}`,
          );
        }
      } catch (error) {
        this.logger.error('OAuth 사용자 저장 중 에러 발생: ', error);
        throw new InternalServerErrorException(
          '로그인 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
        );
      }
    });

    const jwtPayload: Payload = {
      id: user.id,
      email: user.email,
      userName: user.userName,
      role: 'user',
    };

    const serviceRefreshToken = this.userService.createToken(
      jwtPayload,
      'refresh',
    );

    res.cookie('refresh_token', serviceRefreshToken, {
      ...cookieConfig[process.env.NODE_ENV],
      maxAge: REFRESH_TOKEN_TTL,
    });
  }

  private parseStateData(stateString: string): StateData {
    try {
      return JSON.parse(Buffer.from(stateString, 'base64').toString());
    } catch {
      throw new BadRequestException('잘못된 state 형식입니다.');
    }
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
    refreshToken: string | null,
  ) {
    if (refreshToken) {
      provider.refreshToken = refreshToken;
    }

    await this.providerRepository.save(provider);
    this.logger.log(
      `기존 사용자 인증 정보 업데이트 완료: ${provider.user.email}`,
    );
  }
}
