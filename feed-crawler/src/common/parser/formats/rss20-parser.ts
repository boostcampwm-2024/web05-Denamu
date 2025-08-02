import { inject, injectable } from 'tsyringe';
import { BaseFeedParser, RawFeed } from '../base-feed-parser';
import { ParserUtil } from '../utils/parser-util';
import { DEPENDENCY_SYMBOLS } from '../../../types/dependency-symbols';

@injectable()
export class Rss20Parser extends BaseFeedParser {
  constructor(@inject(DEPENDENCY_SYMBOLS.ParserUtil) parserUtil: ParserUtil) {
    super(parserUtil);
  }
  canParse(xmlData: string): boolean {
    try {
      const parsed = this.xmlParser.parse(xmlData);
      return !!parsed.rss?.channel?.item;
    } catch {
      return false;
    }
  }

  protected extractRawFeeds(xmlData: string): RawFeed[] {
    const parsed = this.xmlParser.parse(xmlData);

    if (!Array.isArray(parsed.rss.channel.item)) {
      parsed.rss.channel.item = [parsed.rss.channel.item];
    }

    return parsed.rss.channel.item.map((feed: any) => ({
      title: this.parserUtil.customUnescape(feed.title),
      link: feed.link,
      pubDate: feed.pubDate,
      description: feed.description,
    }));
  }
}
