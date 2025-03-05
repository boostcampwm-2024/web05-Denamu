import { Feed } from '../../src/feed/entity/feed.entity';
import { RssAccept } from '../../src/rss/entity/rss.entity';

export class FeedFixture {
  static createFeedFixture(
    rssAccept: RssAccept,
    overwrites: Partial<Feed> = {},
    index: number = 1,
  ): Feed {
    const feed = new Feed();
    const indexTime = new Date(Date.now() + index * 10000);

    Object.assign(feed, {
      ...{
        createdAt: indexTime,
        title: `test${index}`,
        viewCount: 1,
        path: `https://test.com/test${index}`,
        thumbnail: `https://test.com/test${index}.png`,
        summary: `test summary ${index}`,
      },
      blog: rssAccept,
    });
    return Object.assign(feed, overwrites);
  }
}
