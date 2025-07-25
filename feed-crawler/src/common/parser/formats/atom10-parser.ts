import { inject, injectable } from 'tsyringe';
import { BaseFeedParser, RawFeed } from '../base-feed-parser';
import { ParserUtil } from '../utils/parser-util';
import { DEPENDENCY_SYMBOLS } from '../../../types/dependency-symbols';

@injectable()
export class Atom10Parser extends BaseFeedParser {
  constructor(@inject(DEPENDENCY_SYMBOLS.ParserUtil) parserUtil: ParserUtil) {
    super(parserUtil);
  }
  canParse(xmlData: string): boolean {
    try {
      const parsed = this.xmlParser.parse(xmlData);
      return !!parsed.feed?.entry;
    } catch {
      return false;
    }
  }

  protected extractRawFeeds(xmlData: string): RawFeed[] {
    const parsed = this.xmlParser.parse(xmlData);

    let entries = parsed.feed.entry;
    if (!Array.isArray(entries)) {
      entries = [entries];
    }

    return entries.map((entry: any) => ({
      title: this.parserUtil.customUnescape(entry.title),
      link: this.extractLink(entry.link),
      pubDate: entry.published || entry.updated,
      description: entry.summary || entry.content || '',
    }));
  }

  private extractLink(linkData: any): string {
    // Atom의 link는 다양한 형태가 될 수 있음
    if (typeof linkData === 'string') {
      return linkData;
    }

    if (Array.isArray(linkData)) {
      // rel="alternate"인 링크를 찾거나 첫 번째 링크 사용
      const alternateLink = linkData.find((l) => l['@_rel'] === 'alternate');
      return alternateLink?.['@_href'] || linkData[0]?.['@_href'] || '';
    }

    return linkData?.['@_href'] || linkData?.href || '';
  }
}
