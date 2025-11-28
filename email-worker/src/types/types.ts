export interface Rss {
  name: string;
  userName: string;
  email: string;
  rssUrl: string;
}

export interface RssRegistration {
  rss: Rss;
  approveFlag: boolean;
  description?: string;
}

export interface User {
  email: string;
  userName: string;
  uuid: string;
}

export interface RssRemoval {
  userName: string;
  email: string;
  rssUrl: string;
  certificateCode: string;
}

export const EmailPayloadConstant = {
  USER_CERTIFICATION: 'userCertification',
  RSS_REMOVAL: 'rssRemoval',
  RSS_REGISTRATION: 'rssRegistration',
  PASSWORD_RESET: 'passwordReset',
  ACCOUNT_DELETION: 'accountDeletion',
} as const;

export type EmailPayload =
  | { type: typeof EmailPayloadConstant.USER_CERTIFICATION; data: User }
  | { type: typeof EmailPayloadConstant.RSS_REMOVAL; data: RssRemoval }
  | {
      type: typeof EmailPayloadConstant.RSS_REGISTRATION;
      data: RssRegistration;
    }
  | { type: typeof EmailPayloadConstant.PASSWORD_RESET; data: User }
  | { type: typeof EmailPayloadConstant.ACCOUNT_DELETION; data: User };
