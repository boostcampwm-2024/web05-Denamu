<<<<<<<< HEAD:server/test/config/common/fixture/rss.fixture.ts
import { Rss } from '../../../../src/rss/entity/rss.entity';
========
import { Rss } from '../../../src/rss/entity/rss.entity';
>>>>>>>> 69c12e59 (♻️ refactor: test/fixture -\> test/config/fixture):server/test/config/fixture/rss.fixture.ts

export class RssFixture {
  static createRssFixture(
    overwrites: Partial<Rss> = {},
    index: number = 1,
  ): Rss {
    const rss = new Rss();
    Object.assign(rss, {
      name: `blog${index}`,
      userName: `name${index}`,
      email: `test${index}@test.com`,
      rssUrl: `https://test${index}.com/rss`,
    });
    return Object.assign(rss, overwrites);
  }
}
