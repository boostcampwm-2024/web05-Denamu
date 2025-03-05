import { RssAccept } from '../../src/rss/entity/rss.entity';

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
