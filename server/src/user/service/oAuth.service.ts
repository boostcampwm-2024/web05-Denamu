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

  async callback(callbackDto: OAuthCallbackRequestDto, res: Response) {
    const stateData = this.parseStateData(callbackDto.state);
    const { provider: providerType } = stateData;

    const tokenData = await this.providers[providerType].getTokens(
      callbackDto.code,
    );

    const userInfo = await this.providers[providerType].getUserInfo(tokenData);

    const existingProvider = await this.findExistingProvider(
      providerType,
      userInfo.id,
    );

    if (existingProvider) {
      await this.updateProviderTokens(
        existingProvider,
        tokenData.refresh_token || null,
      );
    }

    let user = await this.userRepository.findOne({
      where: { email: userInfo.email },
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!user) {
        user = await queryRunner.manager.getRepository(User).save({
          email: userInfo.email,
          userName: userInfo.name,
          profileImage: userInfo.picture || null,
          provider: providerType,
        });
        this.logger.log(`새로운 사용자 가입 완료: ${userInfo.email}`);
      }

      if (!existingProvider) {
        await queryRunner.manager.getRepository(Provider).save({
          providerType,
          providerUserId: userInfo.id,
          refreshToken: tokenData.refresh_token || null,
          user,
        });

        this.logger.log(
          `새로운 사용자 인증 정보 저장 완료: ${providerType} ${user.email}`,
        );
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`OAuth 사용자 저장 중 에러 발생: `, error);
      throw new InternalServerErrorException(
        `로그인 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.`,
      );
    } finally {
      await queryRunner.release();
    }

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

  private async updateProviderTokens(provider: Provider, refreshToken: string) {
    if (refreshToken) {
      provider.refreshToken = refreshToken;
    }

    await this.providerRepository.save(provider);
    this.logger.log(
      `기존 사용자 인증 정보 업데이트 완료: ${provider.user.email}`,
    );
  }
}
