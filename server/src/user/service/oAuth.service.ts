import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import * as uuid from 'uuid';
import { Request, Response } from 'express';
import { DataSource, IsNull } from 'typeorm';

import { cookieConfig } from '@common/cookie/cookie.config';
import { Payload } from '@common/guard/jwt.guard';
import { WinstonLoggerService } from '@common/logger/logger.service';
import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { RssAccept } from '@rss/entity/rss.entity';

import {
  OAUTH_CSRF_TOKEN_TTL,
  OAUTH_PENDING_COOKIE,
  OAUTH_PENDING_TTL,
  OAUTH_URL_PATH,
  OAuthLinkData,
  OAuthPendingData,
  OAuthTokenResponse,
  OAuthType,
  StateData,
  UserInfo,
} from '@user/constant/oauth.constant';
import { OAuthCallbackRequestDto } from '@user/dto/request/oAuthCallbackDto';
import { GetLinkedProvidersResponseDto } from '@user/dto/response/getLinkedProviders.dto';
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
    private readonly redisService: RedisService,
    private readonly userService: UserService,
    @Inject('OAUTH_PROVIDERS')
    private readonly providers: Record<string, OAuthProvider>,
    private readonly dataSource: DataSource,
  ) {}

  async getAuthUrl(providerType: OAuthType, res: Response) {
    const csrfToken = uuid.v4();
    res.cookie('oauth_csrf_token', csrfToken, {
      ...cookieConfig[process.env.NODE_ENV],
      maxAge: OAUTH_CSRF_TOKEN_TTL * 1000,
    });
    return await this.providers[providerType].getAuthUrl(csrfToken);
  }

  async initiateLink(userId: number, providerType: OAuthType, res: Response) {
    const csrfToken = uuid.v4();
    res.cookie('oauth_csrf_token', csrfToken, {
      ...cookieConfig[process.env.NODE_ENV],
      maxAge: OAUTH_CSRF_TOKEN_TTL * 1000,
    });

    const linkData: OAuthLinkData = { userId, providerType };
    await this.redisService.set(
      `${REDIS_KEYS.OAUTH_LINK_KEY}:${csrfToken}`,
      JSON.stringify(linkData),
      'EX',
      OAUTH_CSRF_TOKEN_TTL,
    );

    return await this.providers[providerType].getAuthUrl(csrfToken);
  }

  private async tryHandleAccountLink(
    csrfToken: string,
    providerType: string,
    userInfo: UserInfo,
    tokenData: OAuthTokenResponse,
  ): Promise<string | null> {
    const linkKey = `${REDIS_KEYS.OAUTH_LINK_KEY}:${csrfToken}`;
    const linkRaw = await this.redisService.get(linkKey);
    if (!linkRaw) {
      return null;
    }
    await this.redisService.del(linkKey);

    const { userId, providerType: intentProvider }: OAuthLinkData =
      JSON.parse(linkRaw);

    const fail = (reason: string) =>
      `${OAUTH_URL_PATH.BASE_URL}/profile?oauthLink=error&reason=${reason}`;
    const success = `${OAUTH_URL_PATH.BASE_URL}/profile?oauthLink=success&provider=${providerType}`;

    if (intentProvider !== providerType) {
      return fail('mismatch');
    }

    const existing = await this.findExistingProvider(providerType, userInfo.id);
    if (existing) {
      return existing.user.id === userId ? success : fail('already_linked');
    }

    const sameType = await this.providerRepository.findByUserIdAndType(
      userId,
      providerType,
    );
    if (sameType) {
      return fail('duplicate_type');
    }

    try {
      await this.providerRepository.save({
        providerType,
        providerUserId: userInfo.id,
        providerUserName: userInfo.name || null,
        refreshToken: tokenData.refresh_token || null,
        user: { id: userId } as User,
      });
    } catch (error) {
      if ((error as { code?: string })?.code === 'ER_DUP_ENTRY') {
        return fail('duplicate_type');
      }
      this.logger.error(
        `OAuth 연결 저장 중 에러 발생: ${error instanceof Error ? error.stack : JSON.stringify(error)}`,
      );
      return fail('server');
    }

    this.logger.log(`OAuth 연결 완료: user ${userId} ${providerType}`);
    return success;
  }

  async getLinkedProviders(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }
    const providers = await this.providerRepository.findByUserId(userId);
    return GetLinkedProvidersResponseDto.toResponseDto(
      !!user.password,
      providers,
    );
  }

  async unlinkProvider(userId: number, providerType: OAuthType) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    const providers = await this.providerRepository.findByUserId(userId);
    const target = providers.find(
      (p) => p.providerType === (providerType as string),
    );
    if (!target) {
      throw new NotFoundException('연결되지 않은 인증 제공자입니다.');
    }

    if (providers.length === 1 && !user.password) {
      throw new BadRequestException(
        '마지막 인증 수단입니다. 비밀번호를 먼저 설정한 후 해제해주세요.',
      );
    }

    await this.providerRepository.delete(target.id);
    this.logger.log(`OAuth 연결 해제: user ${userId} ${providerType}`);
  }

  async callback(
    callbackDto: OAuthCallbackRequestDto,
    res: Response,
    req: Request,
  ) {
    const stateData = this.parseStateData(callbackDto.state);
    const { provider: providerType, csrfToken: csrfTokenKey } = stateData;
    const cookieCsrfToken = req.cookies['oauth_csrf_token'];

    if (
      callbackDto.error ||
      !callbackDto.code ||
      !csrfTokenKey ||
      !cookieCsrfToken ||
      cookieCsrfToken !== csrfTokenKey
    ) {
      return `${OAUTH_URL_PATH.BASE_URL}/signin`;
    }

    const script = `
      local value = redis.call("GET", KEYS[1])
      if value then
        redis.call("DEL", KEYS[1])
      end
      return value
    `;

    const csrfTokenValue = await this.redisService.eval(script, [csrfTokenKey]);
    res.clearCookie('oauth_csrf_token');
    if (!csrfTokenValue || csrfTokenValue !== `${providerType}-CSRF`) {
      return `${OAUTH_URL_PATH.BASE_URL}/signin`;
    }

    const tokenData = await this.providers[providerType].getTokens(
      callbackDto.code,
    );

    const userInfo = await this.providers[providerType].getUserInfo(tokenData);

    const linkResult = await this.tryHandleAccountLink(
      csrfTokenKey,
      providerType,
      userInfo,
      tokenData,
    );
    if (linkResult) {
      return linkResult;
    }

    const linkedProvider = await this.findExistingProvider(
      providerType,
      userInfo.id,
    );

    if (linkedProvider) {
      await this.updateProviderTokens(
        linkedProvider,
        tokenData.refresh_token || null,
      );
      const jwtPayload: Payload = {
        id: linkedProvider.user.id,
        email: linkedProvider.user.email,
        userName: linkedProvider.user.userName,
        role: 'user',
      };
      this.userService.issueRefreshToken(jwtPayload, res);
      return `${OAUTH_URL_PATH.BASE_URL}/oauth-success`;
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: userInfo.email },
    });

    if (!existingUser) {
      await this.stagePendingOAuthSignUp(
        {
          providerType,
          providerUserId: userInfo.id,
          providerUserName: userInfo.name || null,
          email: userInfo.email,
          profileImage: userInfo.picture || null,
          providerRefreshToken: tokenData.refresh_token || null,
        },
        res,
      );

      return `${OAUTH_URL_PATH.BASE_URL}/oauth-signup`;
    }

    await this.completeOAuthSignIn(
      {
        providerType,
        providerUserId: userInfo.id,
        providerUserName: userInfo.name || null,
        email: userInfo.email,
        userName: existingUser.userName,
        profileImage: userInfo.picture || null,
        providerRefreshToken: tokenData.refresh_token || null,
      },
      res,
    );

    return `${OAUTH_URL_PATH.BASE_URL}/oauth-success`;
  }

  private async stagePendingOAuthSignUp(
    pendingData: OAuthPendingData,
    res: Response,
  ) {
    const pendingToken = uuid.v4();

    await this.redisService.set(
      `${REDIS_KEYS.OAUTH_PENDING_KEY}:${pendingToken}`,
      JSON.stringify(pendingData),
      'EX',
      OAUTH_PENDING_TTL,
    );

    res.cookie(OAUTH_PENDING_COOKIE, pendingToken, {
      ...cookieConfig[process.env.NODE_ENV],
      maxAge: OAUTH_PENDING_TTL * 1000,
    });
  }

  async completeOAuthRegistration(
    userName: string,
    req: Request,
    res: Response,
  ) {
    const pendingToken = req.cookies[OAUTH_PENDING_COOKIE];

    if (!pendingToken) {
      throw new NotFoundException(
        '유효하지 않거나 만료된 가입 요청입니다. 다시 시도해주세요.',
      );
    }

    const pendingKey = `${REDIS_KEYS.OAUTH_PENDING_KEY}:${pendingToken}`;
    const pendingRaw = await this.redisService.get(pendingKey);

    if (!pendingRaw) {
      res.clearCookie(OAUTH_PENDING_COOKIE);
      throw new NotFoundException(
        '유효하지 않거나 만료된 가입 요청입니다. 다시 시도해주세요.',
      );
    }

    const pendingData: OAuthPendingData = JSON.parse(pendingRaw);

    const duplicatedName = await this.userRepository.findOne({
      where: { userName },
    });

    if (duplicatedName) {
      throw new ConflictException('이미 존재하는 닉네임입니다.');
    }

    const user = await this.createOAuthUser(pendingData, userName);

    await this.redisService.del(pendingKey);
    res.clearCookie(OAUTH_PENDING_COOKIE);

    const jwtPayload: Payload = {
      id: user.id,
      email: user.email,
      userName: user.userName,
      role: 'user',
    };

    this.userService.issueRefreshToken(jwtPayload, res);
  }

  private async createOAuthUser(
    pendingData: OAuthPendingData,
    userName: string,
  ): Promise<User> {
    const {
      providerType,
      providerUserId,
      providerUserName,
      email,
      profileImage,
      providerRefreshToken,
    } = pendingData;

    try {
      return await this.dataSource.transaction(async (entityManager) => {
        const user = await entityManager.save(User, {
          email,
          userName,
          profileImage,
        });

        await entityManager.save(Provider, {
          providerType,
          providerUserId,
          providerUserName,
          refreshToken: providerRefreshToken,
          user,
        });

        await entityManager.update(
          RssAccept,
          { email, userId: IsNull() },
          { userId: user.id },
        );

        this.logger.log(`새로운 OAuth 사용자 가입 완료: ${email}`);

        return user;
      });
    } catch (error) {
      if ((error as { code?: string })?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('이미 존재하는 닉네임 또는 계정입니다.');
      }

      if (error instanceof Error) {
        this.logger.error('OAuth 사용자 저장 중 에러 발생', error.stack);
      } else {
        this.logger.error(
          `OAuth 사용자 저장 중 알 수 없는 에러 발생: ${JSON.stringify(error)}`,
        );
      }

      throw new InternalServerErrorException(
        '회원가입 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      );
    }
  }

  async e2eCallback(providerType: OAuthType, res: Response) {
    const normalizedProvider =
      providerType === OAuthType.Github ? OAuthType.Github : OAuthType.Google;

    await this.completeOAuthSignIn(
      {
        providerType: normalizedProvider,
        providerUserId: `e2e-${normalizedProvider}-provider-user`,
        providerUserName: `e2e-${normalizedProvider}-name`,
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
      providerUserName: string | null;
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
      providerUserName,
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
          await entityManager.update(
            RssAccept,
            { email, userId: IsNull() },
            { userId: user.id },
          );
          this.logger.log(`새로운 사용자 가입 완료: ${email}`);
        }

        if (!existingProvider) {
          await entityManager.save(Provider, {
            providerType,
            providerUserId,
            providerUserName,
            refreshToken: providerRefreshToken,
            user,
          });

          this.logger.log(
            `새로운 사용자 인증 정보 저장 완료: ${providerType} ${user.email}`,
          );
        }
      } catch (error) {
        if (error instanceof Error) {
          this.logger.error('OAuth 사용자 저장 중 에러 발생', error.stack);
        } else {
          this.logger.error(
            `OAuth 사용자 저장 중 알 수 없는 에러 발생: ${JSON.stringify(error)}`,
          );
        }

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

    this.userService.issueRefreshToken(jwtPayload, res);
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
