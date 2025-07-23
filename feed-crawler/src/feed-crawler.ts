import { FeedRepository } from './repository/feed.repository';
import { RssRepository } from './repository/rss.repository';
import logger from './common/logger';
import { RssObj, FeedDetail } from './common/types';
import { FeedParserManager } from './common/parser/feed-parser-manager';

export class FeedCrawler {
  constructor(
    private readonly rssRepository: RssRepository,
    private readonly feedRepository: FeedRepository,
    private readonly feedParserManager: FeedParserManager = new FeedParserManager(),
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

  private feedGroupByRss(rssObjects: RssObj[]): Promise<FeedDetail[][]> {
    return Promise.all(
      rssObjects.map(async (rssObj: RssObj) => {
        logger.info(
          `${rssObj.blogName}(${rssObj.rssUrl}) 에서 데이터 조회하는 중...`,
        );
        return await this.feedParserManager.fetchAndParse(rssObj);
      }),
    );
  }
}
