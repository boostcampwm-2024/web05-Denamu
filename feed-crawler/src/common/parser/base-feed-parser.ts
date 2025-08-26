import { XMLParser } from 'fast-xml-parser';
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

export abstract class BaseFeedParser {
  protected readonly xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseAttributeValue: true,
    trimValues: true,
  });
  protected readonly parserUtil: ParserUtil;

  constructor(parserUtil: ParserUtil) {
    this.parserUtil = parserUtil;
  }

  async parseFeed(
    rssObj: RssObj,
    xmlData: string,
    startTime: Date,
  ): Promise<FeedDetail[]> {
    // 각 포맷(atom1.0, rss2.0 등...)
    const rawFeeds = this.extractRawFeeds(xmlData);
    const timeMatchedFeeds = this.filterByTime(rawFeeds, startTime);
    const detailedFeeds = await this.convertToFeedDetails(
      rssObj,
      timeMatchedFeeds,
    );

    return detailedFeeds;
  }

  abstract canParse(xmlData: string): boolean;
  protected abstract extractRawFeeds(xmlData: string): RawFeed[];

  private filterByTime(rawFeeds: RawFeed[], startTime: Date): RawFeed[] {
    const now = new Date(startTime).setSeconds(0, 0);
    return rawFeeds.filter((item) => {
      const pubDate = new Date(item.pubDate).setSeconds(0, 0);
      const timeDiff = (now - pubDate) / (ONE_MINUTE * TIME_INTERVAL);
      return timeDiff >= 0 && timeDiff < 1;
    });
  }

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
