<<<<<<<< HEAD:server/test/config/common/fixture/rss-accept.fixture.ts
import { RssAccept } from '../../../../src/rss/entity/rss.entity';
========
import { RssAccept } from '../../../src/rss/entity/rss.entity';
>>>>>>>> 69c12e59 (♻️ refactor: test/fixture -\> test/config/fixture):server/test/config/fixture/rss-accept.fixture.ts

export class RssAcceptFixture {
  static createRssAcceptFixture(
    overwrites: Partial<RssAccept> = {},
    index = 1,
  ): RssAccept {
    const rssAccept = new RssAccept();
    Object.assign(rssAccept, {
      name: `blog${index}`,
      userName: `name${index}`,
      email: `test${index}@test.com`,
      rssUrl: `https://example${index}.com/rss`,
      blogPlatform: 'etc',
    });
    return Object.assign(rssAccept, overwrites);
  }
}
