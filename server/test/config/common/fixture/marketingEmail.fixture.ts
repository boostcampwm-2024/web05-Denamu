import * as uuid from 'uuid';

import { MarketingEmail } from '@marketingEmail/entity/marketingEmail.entity';

export const MARKETING_EMAIL_DEFAULT_CONTENT =
  '<p>테스트 마케팅 이메일 본문입니다.</p>';

export class MarketingEmailFixture {
  static createGeneralMarketingEmail() {
    return {
      subject: `marketing${uuid.v4()}`,
      content: MARKETING_EMAIL_DEFAULT_CONTENT,
      recipientCount: 0,
      author: null,
    };
  }

  static createMarketingEmailFixture(
    overwrites: Partial<MarketingEmail> = {},
  ): MarketingEmail {
    const marketingEmail = new MarketingEmail();
    return Object.assign(
      marketingEmail,
      this.createGeneralMarketingEmail(),
      overwrites,
    );
  }
}
