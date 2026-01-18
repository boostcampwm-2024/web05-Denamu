import * as uuid from 'uuid';

import { RssAccept } from '@rss/entity/rss.entity';

export class RssAcceptFixture {
  static createGeneralRssAccept() {
    return {
      name: 'test name',
      userName: 'test user name',
      email: `test${uuid.v4()}@test.com`,
      rssUrl: `https://example${uuid.v4()}.com/rss`,
      blogPlatform: 'etc',
    };
  }

  static createRssAcceptFixture(
    overwrites: Partial<RssAccept> = {},
  ): RssAccept {
    const rssAccept = new RssAccept();
    return Object.assign(rssAccept, this.createGeneralRssAccept(), overwrites);
  }
}
