import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { OAuthService } from '../../src/user/service/oauth.service';
import { OAuthCallbackRequestDto } from '../../src/user/dto/request/oAuthCallbackDto';
import { OAuthType } from '../../src/user/constant/oauth.constant';

describe('GET /api/oauth/callback', () => {
  let app: INestApplication;
  let oauthService: OAuthService;

  beforeAll(() => {
    app = global.testApp;
    oauthService = app.get(OAuthService);
  });

  it('[302] ', async () => {
    // given
    const dto = new OAuthCallbackRequestDto({
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
    const response = await request(app.getHttpServer())
      .get('/api/oauth/callback')
      .query(dto);

    // then
    expect(response.status).toBe(302);
    expect(response.headers['location']).toBeDefined();
  });
});
