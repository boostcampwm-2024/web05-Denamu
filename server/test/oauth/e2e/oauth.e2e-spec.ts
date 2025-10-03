import { HttpStatus, INestApplication } from '@nestjs/common';
import { OAuthTypeRequestDto } from '../../src/user/dto/request/oAuthType.dto';
import { OAuthType } from '../../src/user/constant/oauth.constant';
import * as request from 'supertest';
import { OAuthService } from '../../src/user/service/oauth.service';

describe('GET /api/oauth', () => {
  let app: INestApplication;
  let oauthService: OAuthService;

  beforeAll(() => {
    app = global.testApp;
    oauthService = app.get(OAuthService);
  });

  it('[302] 올바른 제공자를 입력했을 경우 Redirect를 받을 수 있다.', async () => {
    // given
    const dto = new OAuthTypeRequestDto({ type: OAuthType.Github });
    const mockProvider = {
      getAuthUrl: jest.fn().mockReturnValue('http://mocked.redirect.url'),
    };

    Object.defineProperty(oauthService, 'providers', {
      value: {
        [OAuthType.Github]: mockProvider,
      },
    });

    jest
      .spyOn(oauthService, 'getAuthUrl')
      .mockImplementation((type: OAuthType) => {
        return 'https://test.com/oauth';
      });

    // when
    const response = await request(app.getHttpServer())
      .get('/api/oauth')
      .query(dto);

    // then
    expect(response.status).toBe(HttpStatus.FOUND);
    expect(response.headers['location']).toBeDefined();
  });
});
