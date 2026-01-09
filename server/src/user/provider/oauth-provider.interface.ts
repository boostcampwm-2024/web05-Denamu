import { OAuthTokenResponse, UserInfo } from '@src/user/constant/oauth.constant';

export interface OAuthProvider {
  getAuthUrl(): string;
  getTokens(code: string): Promise<OAuthTokenResponse>;
  getUserInfo(tokenResponse: OAuthTokenResponse): Promise<UserInfo>;
}
