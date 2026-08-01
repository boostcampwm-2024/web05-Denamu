import * as uuid from 'uuid';

import { Rss } from '@rss/entity/rss.entity';

export class RssFixture {
  static createGeneralRss(): Partial<Rss> {
    return {
      name: `test${uuid.v4()}`,
      userName: 'test',
      email: `test${uuid.v4()}@test.com`,
      rssUrl: `https://test${uuid.v4()}.com/rss`,
      blogUrl: `https://test${uuid.v4()}.com`,
      blogPlatform: 'etc',
    };
  }

  static createRssFixture(overwrites: Partial<Rss> = {}): Rss {
    const rss = new Rss();
    return Object.assign(rss, this.createGeneralRss(), overwrites);
  }
}
