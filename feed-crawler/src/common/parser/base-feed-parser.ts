import { XMLParser } from 'fast-xml-parser';
import { FeedParser } from './feed-parser.interface';
import { FeedDetail, RssObj } from '../types';
import {
  FEED_AI_SUMMARY_IN_PROGRESS_MESSAGE,
  ONE_MINUTE,
  TIME_INTERVAL,
} from '../constant';
import { ParserUtil } from './utils/parser-util';

export interface RawFeed {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

export abstract class BaseFeedParser implements FeedParser {
  protected readonly xmlParser = new XMLParser();
  protected readonly parserUtil = new ParserUtil();

  /**
   * Template Method: 전체 파싱 프로세스 정의
   */
  async parseFeed(rssObj: RssObj, xmlData: string): Promise<FeedDetail[]> {
    // 1. XML 데이터에서 rawFeeds 추출 (각 파서마다 다름)
    const rawFeeds = this.extractRawFeeds(xmlData);

    // 2. 시간 필터링 (공통 로직)
    const timeMatchedFeeds = this.filterByTime(rawFeeds);

    // 3. FeedDetail로 변환 (공통 로직)
    const detailedFeeds = await this.convertToFeedDetails(
      rssObj,
      timeMatchedFeeds,
    );

    return detailedFeeds;
  }

  /**
   * 각 파서에서 구현해야 하는 추상 메서드
   * 해당 파서가 주어진 XML 형식에 대해 파싱이 가능한지 여부를 반환
   */
  abstract canParse(xmlData: string): boolean;

  /**
   * 각 파서에서 구현해야 하는 추상 메서드
   * XML 데이터에서 RawFeed 배열을 추출
   */
  protected abstract extractRawFeeds(xmlData: string): RawFeed[];

  /**
   * 시간 기반 필터링 (공통 로직)
   */
  private filterByTime(rawFeeds: RawFeed[]): RawFeed[] {
    const now = new Date().setSeconds(0, 0);
    return rawFeeds.filter((item) => {
      const pubDate = new Date(item.pubDate).setSeconds(0, 0);
      const timeDiff = (now - pubDate) / (ONE_MINUTE * TIME_INTERVAL);
      return timeDiff >= 0 && timeDiff < 1;
    });
  }

  /**
   * RawFeed를 FeedDetail로 변환 (공통 로직)
   */
  private async convertToFeedDetails(
    rssObj: RssObj,
    rawFeeds: RawFeed[],
  ): Promise<FeedDetail[]> {
    return Promise.all(
      rawFeeds.map(async (feed) => {
        const imageUrl = await this.parserUtil.getThumbnailUrl(feed.link);
        const date = new Date(feed.pubDate);
        const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');

        const content = (feed.description || '')
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;|&#160;/g, ' ')
          .replace(/&[^;]+;/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        return {
          id: null,
          blogId: rssObj.id,
          blogName: rssObj.blogName,
          blogPlatform: rssObj.blogPlatform,
          pubDate: formattedDate,
          title: feed.title,
          link: decodeURIComponent(feed.link),
          imageUrl: imageUrl,
          content: content,
          summary: FEED_AI_SUMMARY_IN_PROGRESS_MESSAGE,
          deathCount: 0,
        } as FeedDetail;
      }),
    );
  }
}
