import { BadRequestException } from '@nestjs/common';

import { Request, Response } from 'express';
import { DataSource } from 'typeorm';

import { WinstonLoggerService } from '@common/logger/logger.service';
import { RedisService } from '@common/redis/redis.service';

import {
  OAUTH_URL_PATH,
  OAuthType,
} from '@user/constant/oauth.constant';
import { OAuthCallbackRequestDto } from '@user/dto/request/oAuthCallbackDto';
import { ProviderRepository } from '@user/repository/provider.repository';
import { UserRepository } from '@user/repository/user.repository';
import { OAuthService } from '@user/service/oAuth.service';
import { UserService } from '@user/service/user.service';

describe(`${OAuthService.name} Unit Test`, () => {
  let oAuthService: OAuthService;
  let userRepository: jest.Mocked<Pick<UserRepository, 'findOne'>>;
  let providerRepository: jest.Mocked<
    Pick<ProviderRepository, 'findByProviderTypeAndId' | 'save'>
  >;
  let logger: jest.Mocked<Pick<WinstonLoggerService, 'log' | 'error'>>;
  let redisService: jest.Mocked<Pick<RedisService, 'eval'>>;
  let userService: jest.Mocked<Pick<UserService, 'issueRefreshToken'>>;
  let googleProvider: {
    getAuthUrl: jest.Mock;
    getTokens: jest.Mock;
    getUserInfo: jest.Mock;
  };
  let manager: { save: jest.Mock };
  let dataSource: jest.Mocked<Pick<DataSource, 'transaction'>>;

  const createResponse = () =>
    ({ cookie: jest.fn(), clearCookie: jest.fn() }) as unknown as Response;

  const createRequest = (csrfCookie?: string) =>
    ({ cookies: { oauth_csrf_token: csrfCookie } }) as unknown as Request;

  const encodeState = (data: object) =>
    Buffer.from(JSON.stringify(data)).toString('base64');

  beforeEach(() => {
    userRepository = { findOne: jest.fn() };
    providerRepository = {
      findByProviderTypeAndId: jest.fn(),
      save: jest.fn(),
    };
    logger = { log: jest.fn(), error: jest.fn() };
    redisService = { eval: jest.fn() };
    userService = { issueRefreshToken: jest.fn() };
    googleProvider = {
      getAuthUrl: jest.fn(),
      getTokens: jest.fn(),
      getUserInfo: jest.fn(),
    };
    manager = {
      save: jest.fn((_entity: any, data: any) =>
        Promise.resolve({ id: 1, ...data }),
      ),
    };
    dataSource = {
      transaction: jest.fn((cb: any) => cb(manager)),
    } as any;

    oAuthService = new OAuthService(
      userRepository as unknown as UserRepository,
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
      expect(googleProvider.getAuthUrl).toHaveBeenCalledWith(expect.any(String));
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

    it('인증에 성공하면 신규 사용자를 생성하고 refresh 쿠키 설정 후 성공 URL을 반환한다.', async () => {
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
      providerRepository.findByProviderTypeAndId.mockResolvedValue(null);
      userRepository.findOne.mockResolvedValue(null);
      const res = createResponse();

      // when
      const result = await oAuthService.callback(dto, res, createRequest('key-1'));

      // then
      expect(manager.save).toHaveBeenCalledTimes(2); // User + Provider
      expect(userService.issueRefreshToken).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'oauth@test.com', role: 'user' }),
        res,
      );
      expect(result).toBe(`${OAUTH_URL_PATH.BASE_URL}/oauth-success`);
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
