import { XMLParser } from 'fast-xml-parser';

import {
  FEED_AI_SUMMARY_IN_PROGRESS_MESSAGE,
  ONE_MINUTE,
  TIME_INTERVAL,
} from '@common/feed/feed.constant';
import { FeedDetail, RssObj } from '@common/feed/feed.type';
import logger from '@common/logger/logger';
import { NOTIFICATION_EVENT } from '@common/notification/notification-event.constant';
import { Notifier } from '@common/notification/notifier.interface';
import { ParserUtil } from '@common/parser/utils/parser-util';

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
  protected readonly notifier: Notifier;

  constructor(parserUtil: ParserUtil, notifier: Notifier) {
    this.parserUtil = parserUtil;
    this.notifier = notifier;
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
      NOTIFICATION_EVENT.FEED_CRAWLING_SCHEDULED,
      '[Scheduled FeedCrawling]',
    );

    return detailedFeeds;
  }

  async parseAllFeeds(rssObj: RssObj, xmlData: string): Promise<FeedDetail[]> {
    const rawFeeds = this.extractRawFeeds(xmlData);
    const detailedFeeds = await this.convertToFeedDetails(
      rssObj,
      rawFeeds,
      NOTIFICATION_EVENT.FEED_CRAWLING_FULL,
      '[Full FeedCrawling]',
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
      return timeDiff >= 0 && timeDiff <= 1;
    });
  }

  private async convertToFeedDetails(
    rssObj: RssObj,
    rawFeeds: RawFeed[],
    event:
      | typeof NOTIFICATION_EVENT.FEED_CRAWLING_SCHEDULED
      | typeof NOTIFICATION_EVENT.FEED_CRAWLING_FULL,
    errorSource: string,
  ): Promise<FeedDetail[]> {
    const results = await Promise.allSettled(
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
        };
      }),
    );

    const succeeded: FeedDetail[] = [];
    const failedReasons: unknown[] = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        succeeded.push(result.value);
      } else {
        failedReasons.push(result.reason);
        logger.warn(
          `[${rssObj.blogName}] 게시글 변환 실패 (${rawFeeds[index]?.link}): ${result.reason}`,
        );
      }
    });

    if (failedReasons.length > 0) {
      const groupedByReason = new Map<string, number>();
      failedReasons.forEach((reason) => {
        const message =
          reason instanceof Error
            ? reason.message
            : (JSON.stringify(reason) ?? 'unknown');
        groupedByReason.set(message, (groupedByReason.get(message) ?? 0) + 1);
      });
      const reasonDetail = [...groupedByReason.entries()]
        .map(([message, count]) => `- ${message} (${count}건)`)
        .join('\n');

      this.notifier.publish(event, {
        error: new Error(
          `${rssObj.blogName}: 게시글 ${failedReasons.length}/${rawFeeds.length}개 변환 실패\n${reasonDetail}`,
        ),
        blogUrl: rssObj.rssUrl,
        errorSource,
      });
    }

    return succeeded;
  }
}
