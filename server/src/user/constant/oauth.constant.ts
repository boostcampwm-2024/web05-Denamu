export const OAUTH_URL_PATH = {
  GOOGLE: {
    AUTH_URL: `https://accounts.google.com/o/oauth2/v2/auth`,
    TOKEN_URL: `https://oauth2.googleapis.com/token`,
    USER_INFO_URL: `https://www.googleapis.com/oauth2/v1/userinfo`,
  },
  GITHUB: {
    AUTH_URL: 'https://github.com/login/oauth/authorize',
    TOKEN_URL: 'https://github.com/login/oauth/access_token',
    USER_INFO_URL: 'https://api.github.com/user',
  },
  REDIRECT_PATH: {
    CALLBACK: `api/oauth/callback`,
  },
  BASE_URL: `https://denamu.dev`,
};

export const OAUTH_CONSTANT = {
  PROVIDER_TYPE: {
    GOOGLE: `google`,
    GITHUB: 'github',
  },
};

export type OAuthTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  id_token?: string;
};

export type UserInfo = {
  id: string;
  email: string;
  name: string;
  picture?: string;
};

export type ProviderData = {
  providerType: string;
  refreshToken?: string;
};

export type StateData = {
  provider: string;
};

export enum OAuthType {
  Google = 'google',
  Github = 'github',
}
