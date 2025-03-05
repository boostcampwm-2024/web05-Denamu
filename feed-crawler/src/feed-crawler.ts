import { FeedRepository } from './repository/feed.repository';
import { RssRepository } from './repository/rss.repository';
import logger from './common/logger';
import { RssObj, FeedDetail, RawFeed } from './common/types';
import { XMLParser } from 'fast-xml-parser';
import { parse } from 'node-html-parser';
import { unescape } from 'html-escaper';
import {
  ONE_MINUTE,
  INTERVAL,
  FEED_AI_SUMMARY_IN_PROGRESS_MESSAGE,
} from './common/constant';

export class FeedCrawler {
  constructor(
    private readonly rssRepository: RssRepository,
    private readonly feedRepository: FeedRepository,
    private readonly rssParser: RssParser,
  ) {}

  async start() {
    logger.info('==========작업 시작==========');
    const startTime = Date.now();

    await this.feedRepository.deleteRecentFeed();

    const rssObjects = await this.rssRepository.selectAllRss();

    if (!rssObjects || !rssObjects.length) {
      logger.info('등록된 RSS가 없습니다.');
      return;
    }

    const newFeedsByRss = await this.feedGroupByRss(rssObjects);
    const newFeeds = newFeedsByRss.flat();

    if (!newFeeds.length) {
      logger.info('새로운 피드가 없습니다.');
      return;
    }
    logger.info(`총 ${newFeeds.length}개의 새로운 피드가 있습니다.`);

    const insertedData: FeedDetail[] = await this.feedRepository.insertFeeds(
      newFeeds,
    );
    await this.feedRepository.saveAiQueue(insertedData);
    await this.feedRepository.setRecentFeedList(insertedData);

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    logger.info(`실행 시간: ${executionTime / 1000}seconds`);
    logger.info('==========작업 완료==========');
  }

  private async findNewFeeds(
    rssObj: RssObj,
    now: number,
  ): Promise<FeedDetail[]> {
    try {
      const TIME_INTERVAL = INTERVAL;
      const feeds = await this.fetchRss(rssObj.rssUrl);

      const filteredFeeds = feeds.filter((item) => {
        const pubDate = new Date(item.pubDate).setSeconds(0, 0);
        const timeDiff = (now - pubDate) / (ONE_MINUTE * TIME_INTERVAL);
        return timeDiff >= 0 && timeDiff < 1;
      });

      const detailedFeeds = await Promise.all(
        filteredFeeds.map(async (feed) => {
          const imageUrl = await this.rssParser.getThumbnailUrl(feed.link);
          const date = new Date(feed.pubDate);
          const formattedDate = date
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ');

          const content = (feed.description ?? feed['content:encoded'] ?? '')
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
      return detailedFeeds;
    } catch (err) {
      logger.warn(
        `[${rssObj.rssUrl}] 에서 데이터 조회 중 오류 발생으로 인한 스킵 처리. 오류 내용 : ${err}`,
      );
      return [];
    }
  }
  private feedGroupByRss(rssObjects: RssObj[]) {
    const currentTime = new Date();
    return Promise.all(
      rssObjects.map(async (rssObj: RssObj) => {
        logger.info(
          `${rssObj.blogName}(${rssObj.rssUrl}) 에서 데이터 조회하는 중...`,
        );
        return await this.findNewFeeds(rssObj, currentTime.setSeconds(0, 0));
      }),
    );
  }

  private async fetchRss(rssUrl: string): Promise<RawFeed[]> {
    const xmlParser = new XMLParser();
    const response = await fetch(rssUrl, {
      headers: {
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
    });

    if (!response.ok) {
      throw new Error(`${rssUrl}에서 xml 추출 실패`);
    }
    const xmlData = await response.text();
    const objFromXml = xmlParser.parse(xmlData);

    if (!Array.isArray(objFromXml.rss.channel.item)) {
      objFromXml.rss.channel.item = [objFromXml.rss.channel.item];
    }

    return objFromXml.rss.channel.item.map((feed: RawFeed) => ({
      title: this.rssParser.customUnescape(feed.title),
      link: feed.link,
      pubDate: feed.pubDate,
      description: feed.description
        ? feed.description
        : feed['content:encoded'],
    }));
  }
}

export class RssParser {
  async getThumbnailUrl(feedUrl: string) {
    const response = await fetch(feedUrl, {
      headers: {
        Accept: 'text/html',
      },
    });

    if (!response.ok) {
      throw new Error(`${feedUrl}에 GET 요청 실패`);
    }

    const htmlData = await response.text();
    const htmlRootElement = parse(htmlData);
    const metaImage = htmlRootElement.querySelector(
      'meta[property="og:image"]',
    );
    let thumbnailUrl = metaImage?.getAttribute('content') ?? '';

    if (!thumbnailUrl.length) {
      logger.warn(`${feedUrl}에서 썸네일 추출 실패`);
      return thumbnailUrl;
    }

    if (!this.isUrlPath(thumbnailUrl)) {
      thumbnailUrl = this.getHttpOriginPath(feedUrl) + thumbnailUrl;
    }
    return thumbnailUrl;
  }

  private isUrlPath(thumbnailUrl: string) {
    const reg = /^(http|https):\/\//;
    return reg.test(thumbnailUrl);
  }

  private getHttpOriginPath(feedUrl: string) {
    return new URL(feedUrl).origin;
  }

  customUnescape(feedTitle: string): string {
    const escapeEntity = {
      '&middot;': '·',
      '&nbsp;': ' ',
    };
    Object.keys(escapeEntity).forEach((escapeKey) => {
      const value = escapeEntity[escapeKey];
      const regex = new RegExp(escapeKey, 'g');
      feedTitle = feedTitle.replace(regex, value);
    });

    return unescape(feedTitle);
  }
}
