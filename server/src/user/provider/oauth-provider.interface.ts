import { OAuthTokenResponse, UserInfo } from '../constant/oauth.constant';

export interface OAuthProvider {
  getAuthUrl(): string;
  getTokens(code: string): Promise<OAuthTokenResponse>;
  getUserInfo(tokenResponse: OAuthTokenResponse): Promise<UserInfo>;
}
