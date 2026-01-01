import { HttpStatus } from '@nestjs/common';
import { OAuthTypeRequestDto } from '../../../src/user/dto/request/oAuthType.dto';
import { OAuthType } from '../../../src/user/constant/oauth.constant';
import * as supertest from 'supertest';
import { OAuthService } from '../../../src/user/service/oAuth.service';
import TestAgent from 'supertest/lib/agent';
import { testApp } from '../../config/e2e/env/jest.setup';

const URL = '/api/oauth';

describe(`GET ${URL}?type={} E2E Test`, () => {
  let agent: TestAgent;
  let oauthService: OAuthService;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    oauthService = testApp.get(OAuthService);
  });

  it('[302] 올바른 제공자를 입력했을 경우 리다이렉트를 성공한다.', async () => {
    // given
    const redirectUrl = 'http://mocked.redirect.url';
    const requestDto = new OAuthTypeRequestDto({ type: OAuthType.Github });
    const mockProvider = {
      getAuthUrl: jest.fn().mockReturnValue(redirectUrl),
    };

    Object.defineProperty(oauthService, 'providers', {
      value: {
        [OAuthType.Github]: mockProvider,
      },
    });

    // Http when
    const response = await agent.get(URL).query(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.FOUND);
    expect(response.headers['location']).toBe(redirectUrl);
    expect(data).toBeUndefined();
  });
});
