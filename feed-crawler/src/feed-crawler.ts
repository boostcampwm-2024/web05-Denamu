import { inject, injectable } from 'tsyringe';

import logger from '@common/logger';
import { FeedParserManager } from '@common/parser/feed-parser-manager';
import { FeedDetail, RssObj } from '@common/types';

import { FeedRepository } from '@repository/feed.repository';
import { RssRepository } from '@repository/rss.repository';

import { DEPENDENCY_SYMBOLS } from '@app-types/dependency-symbols';

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
    logger.info('==========작업 시작==========');

    await this.feedRepository.deleteRecentFeed();

    const rssObjects = await this.rssRepository.selectAllRss();
    if (!rssObjects || !rssObjects.length) {
      logger.info('등록된 RSS가 없습니다.');
      return;
    }

    const newFeedsByRss = await this.feedGroupByRss(rssObjects, startTime);
    const newFeeds = newFeedsByRss.flat();

    if (!newFeeds.length) {
      logger.info('새로운 피드가 없습니다.');
      return;
    }
    logger.info(`총 ${newFeeds.length}개의 새로운 피드가 있습니다.`);
    const insertedData: FeedDetail[] =
      await this.feedRepository.insertFeeds(newFeeds);
    await this.feedRepository.saveAiQueue(insertedData);
    await this.feedRepository.setRecentFeedList(insertedData);

    const endTime = Date.now();
    const executionTime = endTime - startTime.getTime();

    logger.info(`실행 시간: ${executionTime / 1000}seconds`);
    logger.info('==========작업 완료==========');
  }

  async startFullCrawl(rssObj: RssObj): Promise<FeedDetail[]> {
    logger.info(`전체 피드 크롤링 시작: ${rssObj.blogName}(${rssObj.rssUrl})`);

    const newFeeds = await this.feedParserManager.fetchAndParseAll(rssObj);

    if (!newFeeds.length) {
      logger.info(`${rssObj.blogName}에서 가져올 피드가 없습니다.`);
      return [];
    }

    logger.info(
      `${rssObj.blogName}에서 ${newFeeds.length}개의 피드를 가져왔습니다.`,
    );
    const insertedData: FeedDetail[] =
      await this.feedRepository.insertFeeds(newFeeds);
    await this.feedRepository.saveAiQueue(insertedData);

    return insertedData;
  }

  private feedGroupByRss(
    rssObjects: RssObj[],
    startTime: Date,
  ): Promise<FeedDetail[][]> {
    return Promise.all(
      rssObjects.map(async (rssObj: RssObj) => {
        logger.info(
          `${rssObj.blogName}(${rssObj.rssUrl}) 에서 데이터 조회하는 중...`,
        );
        return await this.feedParserManager.fetchAndParse(rssObj, startTime);
      }),
    );
  }
}
