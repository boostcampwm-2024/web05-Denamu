import { Rss } from '../../src/rss/entity/rss.entity';

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
      rssUrl: `https://example${index}.com/rss`,
    });
    return Object.assign(rss, overwrites);
  }
}
