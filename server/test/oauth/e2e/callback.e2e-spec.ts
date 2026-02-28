import { HttpStatus } from '@nestjs/common';

import axios from 'axios';
import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { OAuthType } from '@user/constant/oauth.constant';
import { OAuthCallbackRequestDto } from '@user/dto/request/oAuthCallbackDto';
import { ProviderRepository } from '@user/repository/provider.repository';

import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/oauth/callback';

describe(`GET ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let providerRepository: ProviderRepository;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    providerRepository = testApp.get(ProviderRepository);
  });

  it('[302] Github OAuth 로그인 콜백으로 인증 서버에서 데이터를 받을 경우 리다이렉트를 성공한다.', async () => {
    // given
    const requestDto = new OAuthCallbackRequestDto({
      code: 'testCode',
      state: Buffer.from(
        JSON.stringify({ provider: OAuthType.Github }),
      ).toString('base64'),
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
    const response = await agent.get(URL).query(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.FOUND);
    expect(response.headers['set-cookie'][0]).toContain('refresh_token=');
    expect(response.headers['location']).toContain('/oauth-success');
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedProvider = await providerRepository.findOneBy({
      providerUserId: '1',
      providerType: OAuthType.Github,
    });

    // DB, Redis then
    expect(savedProvider).not.toBeNull();
  });

  it('[302] Google OAuth 로그인 콜백으로 인증 서버에서 데이터를 받을 경우 리다이렉트를 성공한다.', async () => {
    // given
    const requestDto = new OAuthCallbackRequestDto({
      code: 'testCode',
      state: Buffer.from(
        JSON.stringify({ provider: OAuthType.Google }),
      ).toString('base64'),
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
    const response = await agent.get(URL).query(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.FOUND);
    expect(response.headers['set-cookie'][0]).toContain('refresh_token=');
    expect(response.headers['location']).toContain('/oauth-success');
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedProvider = await providerRepository.findOneBy({
      providerUserId: '1',
      providerType: OAuthType.Google,
    });

    // DB, Redis then
    expect(savedProvider).not.toBeNull();
  });

  it('[502] GitHub 토큰 API 호출 실패 시 BadGatewayException을 반환한다.', async () => {
    // given - GitHub OAuth
    const requestDto = new OAuthCallbackRequestDto({
      code: 'invalid_code',
      state: Buffer.from(
        JSON.stringify({ provider: OAuthType.Github }),
      ).toString('base64'),
    });

    // GitHub API가 에러를 던지도록 mock
    jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error('Network Error'));

    // when
    const response = await agent.get(URL).query(requestDto);

    // then - 502 Bad Gateway
    expect(response.status).toBe(HttpStatus.BAD_GATEWAY);
  });

  it('[502] Google 사용자 정보 API 호출 실패 시 BadGatewayException을 반환한다.', async () => {
    // given - Google OAuth
    const requestDto = new OAuthCallbackRequestDto({
      code: 'test_code',
      state: Buffer.from(
        JSON.stringify({ provider: OAuthType.Google }),
      ).toString('base64'),
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
    const response = await agent.get(URL).query(requestDto);

    // then - 502 Bad Gateway
    expect(response.status).toBe(HttpStatus.BAD_GATEWAY);
  });
});
