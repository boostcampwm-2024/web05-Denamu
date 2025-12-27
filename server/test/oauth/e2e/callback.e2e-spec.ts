import { HttpStatus } from '@nestjs/common';
import { OAuthCallbackRequestDto } from '../../../src/user/dto/request/oAuthCallbackDto';
import { OAuthType } from '../../../src/user/constant/oauth.constant';
import axios from 'axios';
import { OAuthE2EHelper } from '../../config/common/helper/oauth/oauth-helper';

const URL = '/api/oauth/callback';

describe(`GET ${URL} E2E Test`, () => {
  const { agent, providerRepository } = new OAuthE2EHelper();

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
    expect(response.headers['location']).toContain('/oauth-success?token=');
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
    expect(response.headers['location']).toContain('/oauth-success?token=');
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedProvider = await providerRepository.findOneBy({
      providerUserId: '1',
      providerType: OAuthType.Google,
    });

    // DB, Redis then
    expect(savedProvider).not.toBeNull();
  });
});
