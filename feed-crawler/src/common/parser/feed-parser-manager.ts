import { FeedParser } from './feed-parser.interface';
import { FeedDetail, RssObj } from '../types';
import { Rss20Parser } from './formats/rss20-parser';
import { Atom10Parser } from './formats/atom10-parser';
import logger from '../logger';

export class FeedParserManager {
  private readonly parsers: FeedParser[] = [
    new Rss20Parser(),
    new Atom10Parser(),
  ];

  async fetchAndParse(rssObj: RssObj): Promise<FeedDetail[]> {
    try {
      const response = await fetch(rssObj.rssUrl, {
        headers: {
          Accept:
            'application/rss+xml, application/xml, text/xml, application/atom+xml',
        },
      });

      if (!response.ok) {
        throw new Error(`${rssObj.rssUrl}에서 피드 데이터 가져오기 실패`);
      }

      const xmlData = await response.text();

      const parser = this.findSuitableParser(xmlData);
      if (!parser) {
        throw new Error(`지원하지 않는 피드 형식: ${rssObj.rssUrl} / `);
      }
      logger.info(`${rssObj.blogName}: ${parser.constructor.name} 사용`);

      return await parser.parseFeed(rssObj, xmlData);
    } catch (error) {
      logger.warn(`[${rssObj.rssUrl}] 피드 파싱 중 오류 발생: ${error}`);
      return [];
    }
  }

  private findSuitableParser(xmlData: string): FeedParser | null {
    for (const parser of this.parsers) {
      if (parser.canParse(xmlData)) {
        return parser;
      }
    }
    return null;
  }
}
