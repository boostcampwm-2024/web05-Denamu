import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { ProviderRepository } from '../repository/provider.repository';
import { WinstonLoggerService } from '../../common/logger/logger.service';
import { Request } from 'express';
import { User } from '../entity/user.entity';
import { Provider } from '../entity/provider.entity';
import {
  OAUTH_URL_PATH,
  OAuthType,
  ProviderData,
  StateData,
  UserInfo,
} from '../constant/oauth.constant';
import { OAuthProvider } from '../provider/oauth-provider.interface';

@Injectable()
export class OAuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly providerRepository: ProviderRepository,
    private readonly logger: WinstonLoggerService,
    @Inject('OAUTH_PROVIDERS')
    private readonly providers: Record<string, OAuthProvider>,
  ) {}

  getAuthUrl(providerType: OAuthType) {
    const oauth = this.providers[providerType];
    if (!oauth)
      throw new BadRequestException('지원하지 않는 인증 제공자입니다.');
    return oauth.getAuthUrl();
  }

  async callback(req: Request) {
    const { code, state } = req.query;
    const stateData = this.parseStateData(state.toString());
    const { provider: providerType } = stateData;

    const tokenData = await this.providers[providerType].getTokens(
      code as string,
    );
    const {
      id_token: idToken,
      access_token: accessToken,
      refresh_token: refreshToken,
    } = tokenData;
    const userInfo = await this.providers[providerType].getUserInfo(
      idToken,
      accessToken,
    );

    await this.saveOAuthUser(userInfo, {
      providerType,
      refreshToken: refreshToken,
    });

    return `${OAUTH_URL_PATH.BASE_URL}`;
  }

  private parseStateData(stateString: string): StateData {
    try {
      return JSON.parse(Buffer.from(stateString, 'base64').toString());
    } catch (error) {
      throw new BadRequestException('잘못된 state 형식입니다.');
    }
  }

  private async saveOAuthUser(userInfo: UserInfo, providerData: ProviderData) {
    const { providerType, refreshToken } = providerData;
    const existingProvider = await this.findExistingProvider(
      providerType,
      userInfo.id,
    );

    if (existingProvider) {
      await this.updateProviderTokens(existingProvider, refreshToken);
      return;
    }
    const user = await this.findOrCreateUser(userInfo, providerType);
    await this.createProvider(providerType, userInfo.id, refreshToken, user);
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

  private async updateProviderTokens(provider: Provider, refreshToken: string) {
    if (refreshToken) {
      provider.refreshToken = refreshToken;
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
    refreshToken: string,
    user: User,
  ) {
    await this.providerRepository.save({
      providerType,
      providerUserId,
      refreshToken,
      user,
    });

    this.logger.log(
      `새로운 사용자 인증 정보 저장 완료: ${providerType} ${user.email}`,
    );
  }
}
