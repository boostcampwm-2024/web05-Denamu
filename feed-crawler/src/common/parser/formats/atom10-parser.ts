import { inject, injectable } from 'tsyringe';

import { DEPENDENCY_SYMBOLS } from '@common/dependency-symbols';
import { Notifier } from '@common/notification/notifier.interface';
import { BaseFeedParser, RawFeed } from '@common/parser/base-feed-parser';
import { ParserUtil } from '@common/parser/utils/parser-util';

@injectable()
export class Atom10Parser extends BaseFeedParser {
  constructor(
    @inject(ParserUtil) parserUtil: ParserUtil,
    @inject(DEPENDENCY_SYMBOLS.Notifier) notifier: Notifier,
  ) {
    super(parserUtil, notifier);
  }
  canParse(xmlData: string): boolean {
    try {
      const parsed = this.xmlParser.parse(xmlData) as { feed?: { entry?: unknown } };
      return !!parsed.feed?.entry;
    } catch {
      return false;
    }
  }

  extractChannelImage(xmlData: string): string | null {
    try {
      const parsed = this.xmlParser.parse(xmlData) as {
        feed?: { logo?: unknown; icon?: unknown };
      };
      const image = parsed.feed?.logo ?? parsed.feed?.icon;
      return typeof image === 'string' && image.trim() ? image.trim() : null;
    } catch {
      return null;
    }
  }

  protected extractRawFeeds(xmlData: string): RawFeed[] {
    type Atom10Entry = { title: any; link: any; published?: any; updated?: any; summary?: any; content?: any };
    type Atom10Parsed = { feed: { entry: Atom10Entry | Atom10Entry[] } };
    const parsed = this.xmlParser.parse(xmlData) as unknown as Atom10Parsed;

    let entries: Atom10Entry[] = parsed.feed.entry as Atom10Entry[];
    if (!Array.isArray(entries)) {
      entries = [parsed.feed.entry as Atom10Entry];
    }

    return entries.map((entry) => ({
      title: this.parserUtil.customUnescape(entry.title),
      link: this.extractLink(entry.link),
      pubDate: entry.published || entry.updated,
      description: entry.summary || entry.content || '',
    }));
  }

  private extractLink(linkData: unknown): string {
    if (typeof linkData === 'string') {
      return linkData;
    }

    if (Array.isArray(linkData)) {
      const items = linkData as { '@_rel'?: string; '@_href'?: string }[];
      const alternateLink = items.find((l) => l['@_rel'] === 'alternate');
      return alternateLink?.['@_href'] ?? '';
    }

    const link = linkData as { '@_href'?: string; href?: string };
    return link['@_href'] ?? link.href ?? '';
  }
}
