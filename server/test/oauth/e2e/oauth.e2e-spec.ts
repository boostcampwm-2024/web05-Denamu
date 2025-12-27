import { HttpStatus } from '@nestjs/common';
import { OAuthTypeRequestDto } from '../../../src/user/dto/request/oAuthType.dto';
import { OAuthType } from '../../../src/user/constant/oauth.constant';
import { OAuthE2EHelper } from '../../config/common/helper/oauth/oauth-helper';

const URL = '/api/oauth';

describe(`GET ${URL}?type={} E2E Test`, () => {
  const { agent, oauthService } = new OAuthE2EHelper();

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
