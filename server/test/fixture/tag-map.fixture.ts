import { TagMap } from '../../src/feed/entity/tag-map.entity';
import { Feed } from '../../src/feed/entity/feed.entity';

export class TagMapFixture {
  static createTagMapFixture(tagNames: string[], feed: Feed): TagMap[] {
    return tagNames.map((tagName) => {
      const tagMap = new TagMap();
      return Object.assign(tagMap, { feed: feed, tag: tagName });
    });
  }
}
