import { RssReject } from '../../src/rss/entity/rss.entity';

export class RssRejectFixture {
  static createRssRejectFixture(
    overwrites: Partial<RssReject> = {},
    index: number = 1,
  ): RssReject {
    const rssReject = new RssReject();
    Object.assign(rssReject, {
      name: `blog${index}`,
      userName: `name${index}`,
      email: `test${index}@test.com`,
      rssUrl: `https://example${index}.com/rss`,
      description: `description${index}`,
    });
    return Object.assign(rssReject, overwrites);
  }
}
