import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { OAuthService } from '../../../src/user/service/oauth.service';
import { OAuthCallbackRequestDto } from '../../../src/user/dto/request/oAuthCallbackDto';
import { OAuthType } from '../../../src/user/constant/oauth.constant';
import TestAgent from 'supertest/lib/agent';

describe('GET /api/oauth/callback E2E Test', () => {
  let app: INestApplication;
  let agent: TestAgent;
  let oauthService: OAuthService;

  beforeAll(() => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    oauthService = app.get(OAuthService);
  });

  it('[302] OAuth 로그인 콜백으로 인증 서버에서 데이터를 받을 경우 리다이렉트를 성공한다.', async () => {
    // given
    const requestDto = new OAuthCallbackRequestDto({
      code: 'testCode',
      state: Buffer.from(
        JSON.stringify({ provider: OAuthType.Github }),
      ).toString('base64'),
    });
    const mockProvider = {
      getTokens: jest.fn().mockResolvedValue({
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
        expires_in: 3600,
      }),
      getUserInfo: jest.fn().mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        name: 'test',
        picture: 'https://test.com/test.png',
      }),
    };

    Object.defineProperty(oauthService, 'providers', {
      value: {
        [OAuthType.Github]: mockProvider,
      },
    });

    // when
    const response = await agent.get('/api/oauth/callback').query(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.FOUND);
    expect(response.headers['location']).toBeDefined();
  });
});
