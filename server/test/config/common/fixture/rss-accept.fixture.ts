import * as uuid from 'uuid';

import { RssAccept } from '@rss/entity/rss.entity';

export class RssAcceptFixture {
  static createGeneralRssAccept() {
    return {
      name: `test name ${uuid.v4()}`,
      userName: 'test user name',
      email: `test${uuid.v4()}@test.com`,
      rssUrl: `https://example${uuid.v4()}.com/rss`,
      blogUrl: `https://example${uuid.v4()}.com`,
      blogPlatform: 'etc',
      suspensionCount: 0,
    };
  }

  static createRssAcceptFixture(
    overwrites: Partial<RssAccept> = {},
  ): RssAccept {
    const rssAccept = new RssAccept();
    return Object.assign(rssAccept, this.createGeneralRssAccept(), overwrites);
  }
}
