import { inject, injectable } from 'tsyringe';
import { FeedRepository } from './repository/feed.repository';
import { RssRepository } from './repository/rss.repository';
import logger from './common/logger';
import { InfoCodes } from './common/log-codes';
import { RssObj, FeedDetail } from './common/types';
import { FeedParserManager } from './common/parser/feed-parser-manager';
import { DEPENDENCY_SYMBOLS } from './types/dependency-symbols';

@injectable()
export class FeedCrawler {
  constructor(
    @inject(DEPENDENCY_SYMBOLS.RssRepository)
    private readonly rssRepository: RssRepository,
    @inject(DEPENDENCY_SYMBOLS.FeedRepository)
    private readonly feedRepository: FeedRepository,
    @inject(DEPENDENCY_SYMBOLS.FeedParserManager)
    private readonly feedParserManager: FeedParserManager,
  ) {}

  async start(startTime: Date) {
    logger.info('크롤링 작업 시작', {
      code: InfoCodes.FC_CRAWL_START,
      context: 'Crawler',
    });

    await this.feedRepository.deleteRecentFeed();

    const rssObjects = await this.rssRepository.selectAllRss();
    if (!rssObjects || !rssObjects.length) {
      logger.info('등록된 RSS가 없습니다', {
        code: InfoCodes.FC_RSS_EMPTY,
        context: 'Crawler',
      });
      return;
    }

    const newFeedsByRss = await this.feedGroupByRss(rssObjects, startTime);
    const newFeeds = newFeedsByRss.flat();

    if (!newFeeds.length) {
      logger.info('새로운 피드가 없습니다', {
        code: InfoCodes.FC_FEED_EMPTY,
        context: 'Crawler',
      });
      return;
    }

    logger.info(`총 ${newFeeds.length}개의 새로운 피드 발견`, {
      code: InfoCodes.FC_FEED_COUNT,
      context: 'Crawler',
      count: newFeeds.length,
    });

    const insertedData: FeedDetail[] = await this.feedRepository.insertFeeds(newFeeds);
    await this.feedRepository.saveAiQueue(insertedData);
    await this.feedRepository.setRecentFeedList(insertedData);

    const endTime = Date.now();
    const executionTime = endTime - startTime.getTime();

    logger.info(`크롤링 완료: ${executionTime}ms`, {
      code: InfoCodes.FC_CRAWL_COMPLETE,
      context: 'Crawler',
      executionTimeMs: executionTime,
      feedCount: insertedData.length,
    });
  }

  async startFullCrawl(rssObj: RssObj): Promise<FeedDetail[]> {
    logger.info(`전체 피드 크롤링: ${rssObj.blogName}`, {
      code: InfoCodes.FC_FULL_CRAWL_START,
      context: 'FullCrawler',
      rssId: rssObj.id,
      blogName: rssObj.blogName,
    });

    const newFeeds = await this.feedParserManager.fetchAndParseAll(rssObj);

    if (!newFeeds.length) {
      logger.info(`${rssObj.blogName}에서 가져올 피드 없음`, {
        code: InfoCodes.FC_FEED_EMPTY,
        context: 'FullCrawler',
        blogName: rssObj.blogName,
      });
      return [];
    }

    logger.info(`${rssObj.blogName}에서 ${newFeeds.length}개 피드 발견`, {
      code: InfoCodes.FC_FEED_FOUND,
      context: 'FullCrawler',
      blogName: rssObj.blogName,
      count: newFeeds.length,
    });

    const insertedData: FeedDetail[] = await this.feedRepository.insertFeeds(newFeeds);
    await this.feedRepository.saveAiQueue(insertedData);

    return insertedData;
  }

  private feedGroupByRss(rssObjects: RssObj[], startTime: Date): Promise<FeedDetail[][]> {
    return Promise.all(
      rssObjects.map(async (rssObj: RssObj) => {
        logger.info(`${rssObj.blogName} 데이터 조회 중`, {
          code: InfoCodes.FC_WORKER_START,
          context: 'RssWorker',
          rssId: rssObj.id,
          blogName: rssObj.blogName,
        });
        return await this.feedParserManager.fetchAndParse(rssObj, startTime);
      }),
    );
  }
}
