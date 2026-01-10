import { BaseFeedParser, RawFeed } from '@common/parser/base-feed-parser';
import { ParserUtil } from '@common/parser/utils/parser-util';

import { DEPENDENCY_SYMBOLS } from '@app-types/dependency-symbols';

import { inject, injectable } from 'tsyringe';

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
    // link 태그가 속성없이 문자 형태 그대로일 경우
    if (typeof linkData === 'string') {
      return linkData;
    }

    // link 태그가 여러개인 경우
    if (Array.isArray(linkData)) {
      const alternateLink = linkData.find((l) => l['@_rel'] === 'alternate');
      return alternateLink['@_href'] || '';
    }

    return linkData['@_href'] || linkData?.href || '';
  }
}
