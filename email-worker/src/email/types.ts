import {
  AdminCertification,
  RssCertification,
  RssRegistration,
  RssRegistrationRequest,
  RssRemoval,
  User,
} from '@common/types';

import { EmailPayloadConstant } from './constant';

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
    };

export type NodeMailerError = Error & {
  code?: string;
  command?: string;
  response?: string;
  responseCode?: number;
};
