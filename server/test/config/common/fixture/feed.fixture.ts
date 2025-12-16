import { Feed } from '../../../../src/feed/entity/feed.entity';
import { RssAccept } from '../../../../src/rss/entity/rss.entity';

export class FeedFixture {
  static createFeedFixture(
    rssAccept: RssAccept,
    overwrites: Partial<Feed> = {},
    index: number = 1,
  ): Feed {
    const feed = new Feed();
    const indexTime = new Date('2025-11-21');

    Object.assign(feed, {
      ...{
        createdAt: new Date(indexTime.getTime() + index * 60 * 60 * 1000),
        title: `test${index}`,
        viewCount: 1,
        path: `https://test.com/test${index}`,
        thumbnail: `https://test.com/test${index}.png`,
        summary: `test summary ${index}`,
        likeCount: 0,
        commentCount: 0,
      },
      blog: rssAccept,
    });
    return Object.assign(feed, overwrites);
  }
}
