export const OAUTH_URL_PATH = {
  GOOGLE: {
    AUTH_URL: `https://accounts.google.com/o/oauth2/v2/auth`,
    TOKEN_URL: `https://oauth2.googleapis.com/token`,
    USER_INFO_URL: `https://www.googleapis.com/oauth2/v1/userinfo`,
  },
  REDIRECT_PATH: {
    CALLBACK: `api/oauth/callback`,
  },
  BASE_URL: `https://denamu.site`,
};

export const OAUTH_CONSTANT = {
  PROVIDER_TYPE: {
    GOOGLE: `google`,
  },
};

export type OAuthTokenResponse = {
  id_token: string;
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
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
