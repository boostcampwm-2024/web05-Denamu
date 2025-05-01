import { OAuthTokenResponse, UserInfo } from '../constant/oauth.constant';

export interface OAuthProvider {
  getAuthUrl(): string;
  getTokens(code: string): Promise<OAuthTokenResponse>;
  getUserInfo(idToken: string, accessToken: string): Promise<UserInfo>;
}
