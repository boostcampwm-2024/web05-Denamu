import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { OAuthType } from '@user/constant/oauth.constant';
import { OAuthTypeRequestDto } from '@user/dto/request/oAuthType.dto';
import { OAuthService } from '@user/service/oAuth.service';

import { testApp } from '@test/config/e2e/env/jest.setup';

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
