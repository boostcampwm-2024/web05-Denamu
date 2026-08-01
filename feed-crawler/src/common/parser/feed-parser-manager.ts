import { inject, injectable } from 'tsyringe';

import axios from 'axios';

import { DEPENDENCY_SYMBOLS } from '@common/dependency-symbols';
import { FeedFetchResult, RssObj } from '@common/feed/feed.type';
import logger from '@common/logger/logger';
import { FeedMetrics } from '@common/metrics/feed-metrics';
import { NOTIFICATION_EVENT } from '@common/notification/notification-event.constant';
import { Notifier } from '@common/notification/notifier.interface';
import { BaseFeedParser } from '@common/parser/base-feed-parser';
import { Atom10Parser } from '@common/parser/formats/atom10-parser';
import { Rss20Parser } from '@common/parser/formats/rss20-parser';

@injectable()
export class FeedParserManager {
  private readonly parsers: BaseFeedParser[];

  constructor(
    @inject(Rss20Parser) rss20Parser: Rss20Parser,
    @inject(Atom10Parser) atom10Parser: Atom10Parser,
    @inject(DEPENDENCY_SYMBOLS.Notifier) private readonly notifier: Notifier,
    @inject(FeedMetrics) private readonly metrics: FeedMetrics,
  ) {
    this.parsers = [rss20Parser, atom10Parser];
  }

  async fetchAndParse(
    rssObj: RssObj,
    startTime: Date,
  ): Promise<FeedFetchResult> {
    this.metrics.total.inc({ type: 'scheduled' });
    try {
      const response = await axios.get<string>(rssObj.rssUrl, {
        headers: {
          Accept:
            'application/rss+xml, application/xml, text/xml, application/atom+xml',
        },
        responseType: 'text',
      });

      const xmlData = response.data;

      const parser = this.findSuitableParser(xmlData);
      if (!parser) {
        throw new Error(`지원하지 않는 피드 형식: ${rssObj.rssUrl}`);
      }

      const feeds = await parser.parseFeed(rssObj, xmlData, startTime);
      this.metrics.success.inc({ type: 'scheduled' });
      return { feeds, channelImage: parser.extractChannelImage(xmlData) };
    } catch (error) {
      this.metrics.failure.inc({ type: 'scheduled' });
      logger.warn(`[${rssObj.rssUrl}] 피드 파싱 중 오류 발생: ${error}`);
      this.notifier.publish(NOTIFICATION_EVENT.FEED_CRAWLING_SCHEDULED, {
        error: error as Error,
        blogUrl: rssObj.rssUrl,
        errorSource: '[Scheduled FeedCrawling]',
      });
      return { feeds: [], channelImage: undefined };
    }
  }

  async fetchAndParseAll(rssObj: RssObj): Promise<FeedFetchResult> {
    this.metrics.total.inc({ type: 'full' });
    try {
      const response = await axios.get<string>(rssObj.rssUrl, {
        headers: {
          Accept:
            'application/rss+xml, application/xml, text/xml, application/atom+xml',
        },
        responseType: 'text',
      });

      const xmlData = response.data;

      const parser = this.findSuitableParser(xmlData);
      if (!parser) {
        throw new Error(`지원하지 않는 피드 형식: ${rssObj.rssUrl}`);
      }
      logger.info(
        `${rssObj.blogName}: ${parser.constructor.name} 사용 (전체 피드)`,
      );

      const feeds = await parser.parseAllFeeds(rssObj, xmlData);
      this.metrics.success.inc({ type: 'full' });
      return { feeds, channelImage: parser.extractChannelImage(xmlData) };
    } catch (error) {
      this.metrics.failure.inc({ type: 'full' });
      logger.warn(`[${rssObj.rssUrl}] 전체 피드 파싱 중 오류 발생: ${error}`);
      this.notifier.publish(NOTIFICATION_EVENT.FEED_CRAWLING_FULL, {
        error: error as Error,
        blogUrl: rssObj.rssUrl,
        errorSource: '[Full FeedCrawling]',
      });
      return { feeds: [], channelImage: undefined };
    }
  }

  private findSuitableParser(xmlData: string): BaseFeedParser | null {
    for (const parser of this.parsers) {
      if (parser.canParse(xmlData)) {
        return parser;
      }
    }
    return null;
  }
}
