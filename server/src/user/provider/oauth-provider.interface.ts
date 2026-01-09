import { OAuthTokenResponse, UserInfo } from '@user/constant/oauth.constant';

export interface OAuthProvider {
  getAuthUrl(): string;
  getTokens(code: string): Promise<OAuthTokenResponse>;
  getUserInfo(tokenResponse: OAuthTokenResponse): Promise<UserInfo>;
}
