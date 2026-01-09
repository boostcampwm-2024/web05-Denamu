import { RssReject } from '@rss/entity/rss.entity';
import * as uuid from 'uuid';

export class RssRejectFixture {
  static createGeneralRssReject() {
    return {
      name: 'test name',
      userName: 'test user name',
      email: `test${uuid.v4()}@test.com`,
      rssUrl: `https://example${uuid.v4()}.com/rss`,
      description: 'test description',
    };
  }

  static createRssRejectFixture(
    overwrites: Partial<RssReject> = {},
  ): RssReject {
    const rssReject = new RssReject();
    return Object.assign(rssReject, this.createGeneralRssReject(), overwrites);
  }
}
