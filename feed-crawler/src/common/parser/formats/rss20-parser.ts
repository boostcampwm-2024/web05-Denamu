import { inject, injectable } from 'tsyringe';

import { BaseFeedParser, RawFeed } from '@common/parser/base-feed-parser';
import { ParserUtil } from '@common/parser/utils/parser-util';

@injectable()
export class Rss20Parser extends BaseFeedParser {
  constructor(@inject(ParserUtil) parserUtil: ParserUtil) {
    super(parserUtil);
  }
  canParse(xmlData: string): boolean {
    try {
      const parsed = this.xmlParser.parse(xmlData) as { rss?: { channel?: { item?: unknown } } };
      return !!parsed.rss?.channel?.item;
    } catch {
      return false;
    }
  }

  protected extractRawFeeds(xmlData: string): RawFeed[] {
    type RssItem = { title: any; link: any; pubDate: any; description: any };
    type Rss20Parsed = { rss: { channel: { item: RssItem | RssItem[] } } };
    const parsed = this.xmlParser.parse(xmlData) as unknown as Rss20Parsed;

    let items: RssItem[] = parsed.rss.channel.item as RssItem[];
    if (!Array.isArray(items)) {
      items = [parsed.rss.channel.item as RssItem];
    }

    return items.map((feed) => ({
      title: this.parserUtil.customUnescape(feed.title),
      link: feed.link,
      pubDate: feed.pubDate,
      description: feed.description,
    }));
  }
}
