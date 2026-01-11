import { Rss } from '../../../../src/rss/entity/rss.entity';
import * as uuid from 'uuid';

export class RssFixture {
  static createGeneralRss(): Partial<Rss> {
    return {
      name: 'test',
      userName: 'test',
      email: `test${uuid.v4()}@test.com`,
      rssUrl: `https://test${uuid.v4()}.com/rss`,
    };
  }

  static createRssFixture(overwrites: Partial<Rss> = {}): Rss {
    const rss = new Rss();
    return Object.assign(rss, this.createGeneralRss(), overwrites);
  }
}
