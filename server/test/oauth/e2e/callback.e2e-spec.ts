import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { OAuthService } from '../../../src/user/service/oauth.service';
import { OAuthCallbackRequestDto } from '../../../src/user/dto/request/oAuthCallbackDto';
import {
  OAUTH_URL_PATH,
  OAuthType,
} from '../../../src/user/constant/oauth.constant';
import TestAgent from 'supertest/lib/agent';
import { UserService } from '../../../src/user/service/user.service';
import axios from 'axios';

const URL = '/api/oauth/callback';

describe(`GET ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let createAccessToken: (arg0?: number) => string;

  beforeAll(() => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const userService = app.get(UserService);

    createAccessToken = () =>
      userService.createToken(
        {
          id: 1,
          email: 'test@test.com',
          userName: 'test',
          role: 'user',
        },
        'access',
      );
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

    const accessToken = createAccessToken();

    // when
    const response = await agent.get(URL).query(requestDto);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.FOUND);
    expect(response.headers['set-cookie'][0]).toContain('refresh_token=');
    expect(response.headers['location']).toBe(
      `${OAUTH_URL_PATH.BASE_URL}/oauth-success?token=${accessToken}`,
    );
    expect(data).toBeUndefined();
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

    const accessToken = createAccessToken();

    // when
    const response = await agent.get(URL).query(requestDto);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.FOUND);
    expect(response.headers['set-cookie'][0]).toContain('refresh_token=');
    expect(response.headers['location']).toBe(
      `${OAUTH_URL_PATH.BASE_URL}/oauth-success?token=${accessToken}`,
    );
    expect(data).toBeUndefined();
  });
});
