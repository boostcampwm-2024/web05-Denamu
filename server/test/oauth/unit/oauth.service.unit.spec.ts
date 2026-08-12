import { BadRequestException, NotFoundException } from '@nestjs/common';

import { Request, Response } from 'express';
import { DataSource } from 'typeorm';

import { WinstonLoggerService } from '@common/logger/logger.service';
import { RedisService } from '@common/redis/redis.service';

import { OAUTH_URL_PATH, OAuthType } from '@user/constant/oauth.constant';
import { OAuthCallbackRequestDto } from '@user/dto/request/oAuthCallbackDto';
import { ProviderRepository } from '@user/repository/provider.repository';
import { UserRepository } from '@user/repository/user.repository';
import { WithdrawnUserRepository } from '@user/repository/withdrawnUser.repository';
import { OAuthService } from '@user/service/oAuth.service';
import { UserService } from '@user/service/user.service';

describe(`${OAuthService.name} Unit Test`, () => {
  let oAuthService: OAuthService;
  let userRepository: jest.Mocked<
    Pick<UserRepository, 'findOne' | 'findOneBy'>
  >;
  let withdrawnUserRepository: jest.Mocked<
    Pick<WithdrawnUserRepository, 'getRejoinAvailableAt'>
  >;
  let providerRepository: jest.Mocked<
    Pick<
      ProviderRepository,
      | 'findByProviderTypeAndId'
      | 'findByUserId'
      | 'findByUserIdAndType'
      | 'save'
      | 'delete'
    >
  >;
  let logger: jest.Mocked<Pick<WinstonLoggerService, 'log' | 'error'>>;
  let redisService: jest.Mocked<
    Pick<RedisService, 'eval' | 'set' | 'get' | 'del'>
  >;
  let userService: jest.Mocked<
    Pick<UserService, 'issueRefreshToken' | 'assertNotSuspended'>
  >;
  let googleProvider: {
    getAuthUrl: jest.Mock;
    getTokens: jest.Mock;
    getUserInfo: jest.Mock;
  };
  let manager: { save: jest.Mock; update: jest.Mock };
  let dataSource: jest.Mocked<Pick<DataSource, 'transaction'>>;

  const createResponse = () =>
    ({ cookie: jest.fn(), clearCookie: jest.fn() }) as unknown as Response;

  const createRequest = (csrfCookie?: string) =>
    ({ cookies: { oauth_csrf_token: csrfCookie } }) as unknown as Request;

  const encodeState = (data: object) =>
    Buffer.from(JSON.stringify(data)).toString('base64');

  beforeEach(() => {
    userRepository = { findOne: jest.fn(), findOneBy: jest.fn() };
    withdrawnUserRepository = {
      getRejoinAvailableAt: jest.fn().mockResolvedValue(null),
    };
    providerRepository = {
      findByProviderTypeAndId: jest.fn(),
      findByUserId: jest.fn(),
      findByUserIdAndType: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    logger = { log: jest.fn(), error: jest.fn() };
    redisService = {
      eval: jest.fn(),
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    };
    userService = {
      issueRefreshToken: jest.fn(),
      assertNotSuspended: jest.fn(),
    };
    googleProvider = {
      getAuthUrl: jest.fn(),
      getTokens: jest.fn(),
      getUserInfo: jest.fn(),
    };
    manager = {
      save: jest.fn((_entity: any, data: any) =>
        Promise.resolve({ id: 1, ...data }),
      ),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    dataSource = {
      transaction: jest.fn((cb: any) => cb(manager)),
    } as any;

    oAuthService = new OAuthService(
      userRepository as unknown as UserRepository,
      withdrawnUserRepository as unknown as WithdrawnUserRepository,
      providerRepository as unknown as ProviderRepository,
      logger as unknown as WinstonLoggerService,
      redisService as unknown as RedisService,
      userService as unknown as UserService,
      { [OAuthType.Google]: googleProvider },
      dataSource as unknown as DataSource,
    );
  });

  describe('getAuthUrl', () => {
    it('CSRF 토큰 쿠키를 설정하고 provider의 인증 URL을 반환한다.', async () => {
      // given
      googleProvider.getAuthUrl.mockResolvedValue('https://auth.url');
      const cookie = jest.fn();
      const res = { cookie } as unknown as Response;

      // when
      const result = await oAuthService.getAuthUrl(OAuthType.Google, res);

      // then
      expect(cookie).toHaveBeenCalledWith(
        'oauth_csrf_token',
        expect.any(String),
        expect.anything(),
      );
      expect(googleProvider.getAuthUrl).toHaveBeenCalledWith(
        expect.any(String),
      );
      expect(result).toBe('https://auth.url');
    });
  });

  describe('callback', () => {
    it('state 형식이 잘못되면 BadRequestException을 던진다.', async () => {
      // given
      const dto = {
        state: '!!!not-base64-json!!!',
        code: 'code',
      } as OAuthCallbackRequestDto;

      // when & then
      await expect(
        oAuthService.callback(dto, createResponse(), createRequest('csrf')),
      ).rejects.toThrow(BadRequestException);
    });

    it('CSRF 쿠키가 state와 다르면 signin으로 리다이렉트한다.', async () => {
      // given
      const dto = {
        state: encodeState({ provider: OAuthType.Google, csrfToken: 'key-1' }),
        code: 'code',
      } as OAuthCallbackRequestDto;

      // when
      const result = await oAuthService.callback(
        dto,
        createResponse(),
        createRequest('different-cookie'),
      );

      // then
      expect(result).toBe(`${OAUTH_URL_PATH.BASE_URL}/signin`);
    });

    it('Redis CSRF 값이 일치하지 않으면 signin으로 리다이렉트한다.', async () => {
      // given
      const dto = {
        state: encodeState({ provider: OAuthType.Google, csrfToken: 'key-1' }),
        code: 'code',
      } as OAuthCallbackRequestDto;
      redisService.eval.mockResolvedValue('wrong-value');

      // when
      const result = await oAuthService.callback(
        dto,
        createResponse(),
        createRequest('key-1'),
      );

      // then
      expect(result).toBe(`${OAUTH_URL_PATH.BASE_URL}/signin`);
    });

    it('신규 사용자는 가입 정보를 임시 저장하고 닉네임 입력 페이지로 리다이렉트한다.', async () => {
      // given
      const dto = {
        state: encodeState({ provider: OAuthType.Google, csrfToken: 'key-1' }),
        code: 'auth-code',
      } as OAuthCallbackRequestDto;
      redisService.eval.mockResolvedValue(`${OAuthType.Google}-CSRF`);
      googleProvider.getTokens.mockResolvedValue({
        access_token: 'at',
        refresh_token: 'rt',
      });
      googleProvider.getUserInfo.mockResolvedValue({
        id: 'provider-uid',
        email: 'oauth@test.com',
        name: 'oauth-user',
        picture: null,
      });
      userRepository.findOne.mockResolvedValue(null);
      const cookie = jest.fn();
      const res = { cookie, clearCookie: jest.fn() } as unknown as Response;

      // when
      const result = await oAuthService.callback(
        dto,
        res,
        createRequest('key-1'),
      );

      // then
      expect(manager.save).not.toHaveBeenCalled();
      expect(userService.issueRefreshToken).not.toHaveBeenCalled();
      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining('oauth:pending'),
        expect.any(String),
        'EX',
        expect.any(Number),
      );
      expect(cookie).toHaveBeenCalledWith(
        'oauth_pending_token',
        expect.any(String),
        expect.anything(),
      );
      expect(result).toBe(`${OAUTH_URL_PATH.BASE_URL}/oauth-signup`);
    });

    it('재가입 제한 기간 중인 이메일은 가입을 임시 저장하지 않고 signin으로 리다이렉트한다.', async () => {
      // given
      const dto = {
        state: encodeState({ provider: OAuthType.Google, csrfToken: 'key-1' }),
        code: 'auth-code',
      } as OAuthCallbackRequestDto;
      redisService.eval.mockResolvedValue(`${OAuthType.Google}-CSRF`);
      googleProvider.getTokens.mockResolvedValue({
        access_token: 'at',
        refresh_token: 'rt',
      });
      googleProvider.getUserInfo.mockResolvedValue({
        id: 'provider-uid',
        email: 'oauth@test.com',
        name: 'oauth-user',
        picture: null,
      });
      userRepository.findOne.mockResolvedValue(null);
      const availableAt = new Date('2026-11-01T00:00:00.000Z');
      withdrawnUserRepository.getRejoinAvailableAt.mockResolvedValue(
        availableAt,
      );

      // when
      const result = await oAuthService.callback(
        dto,
        createResponse(),
        createRequest('key-1'),
      );

      // then
      expect(redisService.set).not.toHaveBeenCalled();
      expect(result).toBe(
        `${OAUTH_URL_PATH.BASE_URL}/signin?error=rejoin_restricted&availableAt=${availableAt.toISOString()}`,
      );
    });

    it('기존 사용자는 바로 로그인 처리 후 성공 URL을 반환한다.', async () => {
      // given
      const dto = {
        state: encodeState({ provider: OAuthType.Google, csrfToken: 'key-1' }),
        code: 'auth-code',
      } as OAuthCallbackRequestDto;
      redisService.eval.mockResolvedValue(`${OAuthType.Google}-CSRF`);
      googleProvider.getTokens.mockResolvedValue({
        access_token: 'at',
        refresh_token: 'rt',
      });
      googleProvider.getUserInfo.mockResolvedValue({
        id: 'provider-uid',
        email: 'oauth@test.com',
        name: 'oauth-user',
        picture: null,
      });
      userRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'oauth@test.com',
        userName: 'existing-user',
      } as any);
      providerRepository.findByProviderTypeAndId.mockResolvedValue(null);
      const res = createResponse();

      // when
      const result = await oAuthService.callback(
        dto,
        res,
        createRequest('key-1'),
      );

      // then
      expect(userService.issueRefreshToken).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'oauth@test.com', role: 'user' }),
        res,
      );
      expect(result).toBe(`${OAUTH_URL_PATH.BASE_URL}/oauth-success`);
    });
  });

  describe('callback - 계정 연결(link)', () => {
    const linkDto = () =>
      ({
        state: encodeState({ provider: OAuthType.Google, csrfToken: 'key-1' }),
        code: 'auth-code',
      }) as OAuthCallbackRequestDto;

    const setupLinkCallback = (linkData: object) => {
      redisService.eval.mockResolvedValue(`${OAuthType.Google}-CSRF`);
      googleProvider.getTokens.mockResolvedValue({
        access_token: 'at',
        refresh_token: 'rt',
      });
      googleProvider.getUserInfo.mockResolvedValue({
        id: 'provider-uid',
        email: 'oauth@test.com',
        name: 'oauth-handle',
        picture: null,
      });
      redisService.get.mockResolvedValue(JSON.stringify(linkData));
    };

    it('연결되지 않은 제공자는 현재 유저에 연결하고 성공 URL을 반환하며 토큰을 재발급하지 않는다.', async () => {
      // given
      setupLinkCallback({ userId: 1, providerType: OAuthType.Google });
      providerRepository.findByProviderTypeAndId.mockResolvedValue(null);
      providerRepository.findByUserIdAndType.mockResolvedValue(null);

      // when
      const result = await oAuthService.callback(
        linkDto(),
        createResponse(),
        createRequest('key-1'),
      );

      // then
      expect(providerRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          providerType: OAuthType.Google,
          providerUserId: 'provider-uid',
          providerUserName: 'oauth-handle',
          user: { id: 1 },
        }),
      );
      expect(userService.issueRefreshToken).not.toHaveBeenCalled();
      expect(result).toBe(
        `${OAUTH_URL_PATH.BASE_URL}/profile?oauthLink=success&provider=${OAuthType.Google}`,
      );
    });

    it('이미 본인에게 연결된 제공자는 멱등 처리(저장 없이 성공)한다.', async () => {
      // given
      setupLinkCallback({ userId: 1, providerType: OAuthType.Google });
      providerRepository.findByProviderTypeAndId.mockResolvedValue({
        id: 10,
        user: { id: 1 },
      } as any);

      // when
      const result = await oAuthService.callback(
        linkDto(),
        createResponse(),
        createRequest('key-1'),
      );

      // then
      expect(providerRepository.save).not.toHaveBeenCalled();
      expect(result).toContain('oauthLink=success');
    });

    it('타 유저에게 연결된 제공자는 already_linked 에러로 리다이렉트한다.', async () => {
      // given
      setupLinkCallback({ userId: 1, providerType: OAuthType.Google });
      providerRepository.findByProviderTypeAndId.mockResolvedValue({
        id: 10,
        user: { id: 999 },
      } as any);

      // when
      const result = await oAuthService.callback(
        linkDto(),
        createResponse(),
        createRequest('key-1'),
      );

      // then
      expect(providerRepository.save).not.toHaveBeenCalled();
      expect(result).toContain('oauthLink=error&reason=already_linked');
    });

    it('같은 종류가 이미 연결돼 있으면 duplicate_type 에러로 리다이렉트한다.', async () => {
      // given
      setupLinkCallback({ userId: 1, providerType: OAuthType.Google });
      providerRepository.findByProviderTypeAndId.mockResolvedValue(null);
      providerRepository.findByUserIdAndType.mockResolvedValue({
        id: 5,
      } as any);

      // when
      const result = await oAuthService.callback(
        linkDto(),
        createResponse(),
        createRequest('key-1'),
      );

      // then
      expect(providerRepository.save).not.toHaveBeenCalled();
      expect(result).toContain('oauthLink=error&reason=duplicate_type');
    });
  });

  describe('unlinkProvider', () => {
    it('마지막 OAuth이고 비밀번호가 없으면 BadRequestException을 던진다.', async () => {
      // given
      userRepository.findOneBy.mockResolvedValue({
        id: 1,
        password: null,
      } as any);
      providerRepository.findByUserId.mockResolvedValue([
        { id: 10, providerType: OAuthType.Google },
      ] as any);

      // when & then
      await expect(
        oAuthService.unlinkProvider(1, OAuthType.Google),
      ).rejects.toThrow(BadRequestException);
      expect(providerRepository.delete).not.toHaveBeenCalled();
    });

    it('마지막 OAuth라도 비밀번호가 있으면 해제한다.', async () => {
      // given
      userRepository.findOneBy.mockResolvedValue({
        id: 1,
        password: 'hashed',
      } as any);
      providerRepository.findByUserId.mockResolvedValue([
        { id: 10, providerType: OAuthType.Google },
      ] as any);

      // when
      await oAuthService.unlinkProvider(1, OAuthType.Google);

      // then
      expect(providerRepository.delete).toHaveBeenCalledWith(10);
    });

    it('연결되지 않은 제공자를 해제하면 NotFoundException을 던진다.', async () => {
      // given
      userRepository.findOneBy.mockResolvedValue({
        id: 1,
        password: 'hashed',
      } as any);
      providerRepository.findByUserId.mockResolvedValue([
        { id: 10, providerType: OAuthType.Github },
      ] as any);

      // when & then
      await expect(
        oAuthService.unlinkProvider(1, OAuthType.Google),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLinkedProviders', () => {
    it('비밀번호 보유 여부와 연결된 제공자 목록을 반환한다.', async () => {
      // given
      userRepository.findOneBy.mockResolvedValue({
        id: 1,
        password: 'hashed',
      } as any);
      providerRepository.findByUserId.mockResolvedValue([
        {
          providerType: OAuthType.Google,
          providerUserName: 'oauth-handle',
          createdAt: new Date('2026-01-01'),
        },
      ] as any);

      // when
      const result = await oAuthService.getLinkedProviders(1);

      // then
      expect(result.hasPassword).toBe(true);
      expect(result.providers).toEqual([
        expect.objectContaining({
          provider: OAuthType.Google,
          providerUserName: 'oauth-handle',
        }),
      ]);
    });
  });

  describe('e2eCallback', () => {
    it('테스트용 OAuth 로그인을 처리하고 refresh 쿠키를 설정한다.', async () => {
      // given
      providerRepository.findByProviderTypeAndId.mockResolvedValue(null);
      userRepository.findOne.mockResolvedValue(null);
      const res = createResponse();

      // when
      await oAuthService.e2eCallback(OAuthType.Google, res);

      // then
      expect(userService.issueRefreshToken).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'user' }),
        res,
      );
    });
  });
});
