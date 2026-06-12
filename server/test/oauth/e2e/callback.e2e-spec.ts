import { HttpStatus } from '@nestjs/common';

import axios from 'axios';
import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { RedisService } from '@common/redis/redis.service';

import { OAUTH_CSRF_TOKEN_TTL, OAuthType } from '@user/constant/oauth.constant';
import { OAuthCallbackRequestDto } from '@user/dto/request/oAuthCallbackDto';
import { ProviderRepository } from '@user/repository/provider.repository';
import { UserRepository } from '@user/repository/user.repository';

import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/oauth/callback';

describe(`GET ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let providerRepository: ProviderRepository;
  let userRepository: UserRepository;
  let redisService: RedisService;

  const createCsrfState = async (provider: OAuthType) => {
    const csrfToken = `csrf-token-${provider}`;

    await redisService.setex(
      csrfToken,
      OAUTH_CSRF_TOKEN_TTL,
      `${provider}-CSRF`,
    );

    return {
      csrfToken,
      state: Buffer.from(JSON.stringify({ provider, csrfToken })).toString(
        'base64',
      ),
    };
  };

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    providerRepository = testApp.get(ProviderRepository);
    userRepository = testApp.get(UserRepository);
    redisService = testApp.get(RedisService);
  });

  it('[302] 신규 사용자가 Github OAuth 콜백을 받을 경우 닉네임 입력 페이지로 리다이렉트한다.', async () => {
    // given
    const { csrfToken, state } = await createCsrfState(OAuthType.Github);
    const requestDto = new OAuthCallbackRequestDto({
      code: 'testCode',
      state,
    });

    jest.spyOn(axios, 'post').mockResolvedValue({
      data: {
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
        expires_in: 3600,
      },
    });

    jest.spyOn(axios, 'get').mockResolvedValue({
      data: {
        id: '1',
        email: 'test@test.com',
        name: 'test',
        avatar_url: 'https://test.com/test.png',
      },
    });

    // Http when
    const response = await agent
      .get(URL)
      .query(requestDto)
      .set('Cookie', `oauth_csrf_token=${csrfToken}`);

    // Http then
    const setCookies = getSetCookies(response.headers['set-cookie']);

    expect(response.status).toBe(HttpStatus.FOUND);
    expect(
      setCookies.some((cookie) => cookie.startsWith('oauth_pending_token=')),
    ).toBe(true);
    expect(response.headers['location']).toContain('/oauth-signup');

    // DB then - 닉네임 입력 전이므로 provider 저장 안 됨
    const savedProvider = await providerRepository.findOneBy({
      providerUserId: '1',
      providerType: OAuthType.Github,
    });
    expect(savedProvider).toBeNull();
  });

  it('[302] 신규 사용자가 Google OAuth 콜백을 받을 경우 닉네임 입력 페이지로 리다이렉트한다.', async () => {
    // given
    const { csrfToken, state } = await createCsrfState(OAuthType.Google);
    const requestDto = new OAuthCallbackRequestDto({
      code: 'testCode',
      state,
    });

    jest.spyOn(axios, 'post').mockResolvedValue({
      data: {
        id_token: '1',
        access_token: 'test_access_token',
        expires_in: 3600,
      },
    });

    jest.spyOn(axios, 'get').mockResolvedValue({
      data: {
        id: '1',
        email: 'test@test.com',
        name: 'test',
        picture: 'https://test.com/test.png',
      },
    });

    // Http when
    const response = await agent
      .get(URL)
      .query(requestDto)
      .set('Cookie', `oauth_csrf_token=${csrfToken}`);

    // Http then
    const setCookies = getSetCookies(response.headers['set-cookie']);

    expect(response.status).toBe(HttpStatus.FOUND);
    expect(
      setCookies.some((cookie) => cookie.startsWith('oauth_pending_token=')),
    ).toBe(true);
    expect(response.headers['location']).toContain('/oauth-signup');

    const savedProvider = await providerRepository.findOneBy({
      providerUserId: '1',
      providerType: OAuthType.Google,
    });
    expect(savedProvider).toBeNull();
  });

  it('[302] 기존 사용자가 Google OAuth 콜백을 받을 경우 바로 로그인 처리 후 성공 페이지로 리다이렉트한다.', async () => {
    // given
    await userRepository.save(
      UserFixture.createUserFixture({ email: 'test@test.com' }),
    );
    const { csrfToken, state } = await createCsrfState(OAuthType.Google);
    const requestDto = new OAuthCallbackRequestDto({
      code: 'testCode',
      state,
    });

    jest.spyOn(axios, 'post').mockResolvedValue({
      data: {
        id_token: '1',
        access_token: 'test_access_token',
        expires_in: 3600,
      },
    });

    jest.spyOn(axios, 'get').mockResolvedValue({
      data: {
        id: '1',
        email: 'test@test.com',
        name: 'test',
        picture: 'https://test.com/test.png',
      },
    });

    // Http when
    const response = await agent
      .get(URL)
      .query(requestDto)
      .set('Cookie', `oauth_csrf_token=${csrfToken}`);

    // Http then
    const setCookies = getSetCookies(response.headers['set-cookie']);

    expect(response.status).toBe(HttpStatus.FOUND);
    expect(
      setCookies.some((cookie) => cookie.startsWith('refresh_token=')),
    ).toBe(true);
    expect(response.headers['location']).toContain('/oauth-success');

    // DB then - 기존 사용자에 provider 연결
    const savedProvider = await providerRepository.findOneBy({
      providerUserId: '1',
      providerType: OAuthType.Google,
    });
    expect(savedProvider).not.toBeNull();
  });

  it('[502] GitHub 토큰 API 호출 실패 시 BadGatewayException을 반환한다.', async () => {
    // given - GitHub OAuth
    const { csrfToken, state } = await createCsrfState(OAuthType.Github);
    const requestDto = new OAuthCallbackRequestDto({
      code: 'invalid_code',
      state,
    });

    // GitHub API가 에러를 던지도록 mock
    jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error('Network Error'));

    // when
    const response = await agent
      .get(URL)
      .query(requestDto)
      .set('Cookie', `oauth_csrf_token=${csrfToken}`);

    // then - 502 Bad Gateway
    expect(response.status).toBe(HttpStatus.BAD_GATEWAY);
  });

  it('[502] Google 사용자 정보 API 호출 실패 시 BadGatewayException을 반환한다.', async () => {
    // given - Google OAuth
    const { csrfToken, state } = await createCsrfState(OAuthType.Google);
    const requestDto = new OAuthCallbackRequestDto({
      code: 'test_code',
      state,
    });

    // 토큰은 성공하지만 사용자 정보 조회 실패
    jest.spyOn(axios, 'post').mockResolvedValueOnce({
      data: {
        id_token: 'valid_token',
        access_token: 'test_access_token',
        expires_in: 3600,
      },
    });

    jest
      .spyOn(axios, 'get')
      .mockRejectedValueOnce(new Error('API Unavailable'));

    // when
    const response = await agent
      .get(URL)
      .query(requestDto)
      .set('Cookie', `oauth_csrf_token=${csrfToken}`);

    // then - 502 Bad Gateway
    expect(response.status).toBe(HttpStatus.BAD_GATEWAY);
  });

  const getSetCookies = (header: string | string[] | undefined): string[] => {
    if (Array.isArray(header)) {
      return header;
    }
    if (typeof header === 'string') {
      return [header];
    }
    return [];
  };
});
