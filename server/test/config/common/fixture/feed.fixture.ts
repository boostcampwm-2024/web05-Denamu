import * as uuid from 'uuid';

import { Feed } from '@feed/entity/feed.entity';

import { RssAccept } from '@rss/entity/rss.entity';

export class FeedFixture {
  static createGeneralFeed(index: number) {
    return {
      createdAt: new Date(
        new Date('2025-12-18').getTime() + index * 60 * 60 * 1000,
      ),
      title: 'test title',
      viewCount: 1,
      path: `https://test.com/test${uuid.v4()}`,
      thumbnail: `https://test.com/test${uuid.v4()}.png`,
      summary: `test summary`,
      likeCount: 0,
      commentCount: 0,
    };
  }

  static createFeedFixture(
    rssAccept: RssAccept,
    overwrites: Partial<Feed> = {},
    index = 1,
  ): Feed {
    const feed = new Feed();
    return Object.assign(
      feed,
      this.createGeneralFeed(index),
      { blog: rssAccept },
      overwrites,
    );
  }

  static createFeedsFixture(rssAccept: RssAccept, count: number): Feed[] {
    return Array.from({ length: count }).map((_, i) =>
      this.createFeedFixture(
        rssAccept,
        {
          title: `test title ${i + 1}`,
        },
        i + 1,
      ),
    );
  }
}
