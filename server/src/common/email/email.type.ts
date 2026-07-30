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

export interface RssRegistrationRequest {
  rss: Rss;
  adminEmail: string;
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

export interface RssCertification {
  userName: string;
  email: string;
  blogName: string;
  certificateCode: string;
}

export interface AdminCertification {
  email: string;
  name: string;
  uuid: string;
}

export interface QnaAnswered {
  email: string;
  recipientName: string;
  qnaId: number;
  qnaTitle: string;
}

export const EmailPayloadConstant = {
  USER_CERTIFICATION: 'userCertification',
  RSS_REMOVAL: 'rssRemoval',
  RSS_CERTIFICATION: 'rssCertification',
  RSS_REGISTRATION: 'rssRegistration',
  RSS_REGISTRATION_REQUEST: 'rssRegistrationRequest',
  PASSWORD_RESET: 'passwordReset',
  ACCOUNT_DELETION: 'accountDeletion',
  ADMIN_CERTIFICATION: 'adminCertification',
  ADMIN_ACCOUNT_DELETION: 'adminAccountDeletion',
  ADMIN_PASSWORD_RESET: 'adminPasswordReset',
  QNA_ANSWERED: 'qnaAnswered',
} as const;

export type EmailPayload =
  | { type: typeof EmailPayloadConstant.USER_CERTIFICATION; data: User }
  | { type: typeof EmailPayloadConstant.RSS_REMOVAL; data: RssRemoval }
  | {
      type: typeof EmailPayloadConstant.RSS_CERTIFICATION;
      data: RssCertification;
    }
  | {
      type: typeof EmailPayloadConstant.RSS_REGISTRATION;
      data: RssRegistration;
    }
  | {
      type: typeof EmailPayloadConstant.RSS_REGISTRATION_REQUEST;
      data: RssRegistrationRequest;
    }
  | { type: typeof EmailPayloadConstant.PASSWORD_RESET; data: User }
  | { type: typeof EmailPayloadConstant.ACCOUNT_DELETION; data: User }
  | {
      type: typeof EmailPayloadConstant.ADMIN_CERTIFICATION;
      data: AdminCertification;
    }
  | {
      type: typeof EmailPayloadConstant.ADMIN_ACCOUNT_DELETION;
      data: AdminCertification;
    }
  | {
      type: typeof EmailPayloadConstant.ADMIN_PASSWORD_RESET;
      data: AdminCertification;
    }
  | { type: typeof EmailPayloadConstant.QNA_ANSWERED; data: QnaAnswered };
