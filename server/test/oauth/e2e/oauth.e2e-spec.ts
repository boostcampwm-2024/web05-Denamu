import { HttpStatus, INestApplication } from '@nestjs/common';
import { OAuthTypeRequestDto } from '../../../src/user/dto/request/oAuthType.dto';
import { OAuthType } from '../../../src/user/constant/oauth.constant';
import * as supertest from 'supertest';
import { OAuthService } from '../../../src/user/service/oauth.service';
import TestAgent from 'supertest/lib/agent';

describe('GET /api/oauth?type={} E2E Test', () => {
  let app: INestApplication;
  let agent: TestAgent;
  let oauthService: OAuthService;

  beforeAll(() => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    oauthService = app.get(OAuthService);
  });

  it('[302] 올바른 제공자를 입력했을 경우 리다이렉트를 성공한다.', async () => {
    // given
    const requestDto = new OAuthTypeRequestDto({ type: OAuthType.Github });
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
    const response = await agent.get('/api/oauth').query(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.FOUND);
    expect(response.headers['location']).toBeDefined();
  });
});
