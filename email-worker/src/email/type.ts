import { RssRegistration, RssRemoval, User } from '@app-types/types';

import { EmailPayloadConstant } from './constant';

export type EmailPayload =
  | { type: typeof EmailPayloadConstant.USER_CERTIFICATION; data: User }
  | { type: typeof EmailPayloadConstant.RSS_REMOVAL; data: RssRemoval }
  | {
      type: typeof EmailPayloadConstant.RSS_REGISTRATION;
      data: RssRegistration;
    }
  | { type: typeof EmailPayloadConstant.PASSWORD_RESET; data: User }
  | { type: typeof EmailPayloadConstant.ACCOUNT_DELETION; data: User };
