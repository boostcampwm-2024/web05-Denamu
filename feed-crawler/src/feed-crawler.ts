import { inject, injectable } from 'tsyringe';

import axios from 'axios';

import { PermanentError, RetryableError } from '@common/errors';
import { FeedDetail, RssObj } from '@common/feed/feed.type';
import logger from '@common/logger/logger';
import { FeedParserManager } from '@common/parser/feed-parser-manager';

import { FeedRepository } from '@repository/feed.repository';
import { RssRepository } from '@repository/rss.repository';

@injectable()
export class FeedCrawler {
  constructor(
    @inject(RssRepository)
    private readonly rssRepository: RssRepository,
    @inject(FeedRepository)
    private readonly feedRepository: FeedRepository,
    @inject(FeedParserManager)
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

    const crawlResults = await Promise.all(
      rssObjects.map((rssObj) => this.crawlRss(rssObj, startTime)),
    );
    const newFeeds = crawlResults.flatMap((result) => result.feeds);

    if (!newFeeds.length) {
      logger.info('새로운 피드가 없습니다.');
      return;
    }
    logger.info(`총 ${newFeeds.length}개의 새로운 피드가 있습니다.`);
    const insertedData: FeedDetail[] =
      await this.feedRepository.insertFeeds(newFeeds);
    await this.feedRepository.saveAiQueue(insertedData);
    await this.feedRepository.setRecentFeedList(
      insertedData,
      crawlResults.map((result) => result.rssObj),
    );

    const executionTime = Date.now() - startTime.getTime();

    logger.info(`실행 시간: ${executionTime / 1000}seconds`);
    logger.info('==========작업 완료==========');
  }

  async startFullCrawl(rssId: number): Promise<FeedDetail[]> {
    const rssObj = await this.rssRepository.selectRssById(rssId);
    if (!rssObj) {
      logger.warn(`전체 피드 크롤링 대상 RSS ID ${rssId}를 찾을 수 없습니다.`);
      return [];
    }

    logger.info(`전체 피드 크롤링 시작: ${rssObj.blogName}(${rssObj.rssUrl})`);

    const { feeds: newFeeds } = await this.crawlRssAll(rssObj);

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

  async requeueFeedForAiSummary(feedId: number): Promise<void> {
    const feed = await this.feedRepository.selectFeedById(feedId);
    if (!feed) {
      throw new PermanentError(`피드를 찾을 수 없습니다: ${feedId}`);
    }

    const rssObj = await this.rssRepository.selectRssById(feed.blogId);
    if (!rssObj) {
      throw new PermanentError(`RSS를 찾을 수 없습니다: blogId=${feed.blogId}`);
    }

    const { feeds: allFeeds } = await this.crawlRssAll(rssObj);
    const matched = allFeeds.find((parsed) => parsed.link === feed.path);
    if (!matched) {
      throw await this.buildMissingFeedError(feedId, feed.path);
    }

    await this.feedRepository.saveAiQueue([
      { ...matched, id: feed.id, deathCount: 0 },
    ]);
    logger.info(
      `[AI 재요청] feedId=${feedId} 게시글을 AI 큐에 다시 넣었습니다.`,
    );
  }

  private async buildMissingFeedError(
    feedId: number,
    path: string,
  ): Promise<Error> {
    const status = await this.probeOriginStatus(path);

    if (status === 200) {
      return new PermanentError(
        `RSS에서 찾을 수 없습니다 (원본 HTTP 200, RSS 노출 범위를 벗어난 오래된 게시글): feedId=${feedId}`,
      );
    }
    if (status === 404) {
      return new PermanentError(
        `RSS에서 찾을 수 없습니다 (원본 HTTP 404, 삭제된 게시글): feedId=${feedId}`,
      );
    }

    return new RetryableError(
      `원본 게시글 상태 확인 실패 (HTTP ${status ?? 'NETWORK_ERROR'}), 일시적 서버 오류로 재시도 필요: feedId=${feedId}`,
    );
  }

  private async probeOriginStatus(path: string): Promise<number | null> {
    try {
      const response = await axios.get(path, { validateStatus: () => true });
      return response.status;
    } catch {
      return null;
    }
  }

  private async crawlRss(
    rssObj: RssObj,
    startTime: Date,
  ) {
    logger.info(
      `${rssObj.blogName}(${rssObj.rssUrl}) 에서 데이터 조회하는 중...`,
    );
    const result = await this.feedParserManager.fetchAndParse(
      rssObj,
      startTime,
    );
    await this.syncChannelImage(rssObj, result.rssObj);
    return result;
  }

  private async crawlRssAll(rssObj: RssObj) {
    const result = await this.feedParserManager.fetchAndParseAll(rssObj);
    await this.syncChannelImage(rssObj, result.rssObj);
    return result;
  }

  private async syncChannelImage(rssObj: RssObj, updatedRssObj: RssObj) {
    if (updatedRssObj.blogImage === rssObj.blogImage) {
      return;
    }
    try {
      await this.rssRepository.updateImage(
        updatedRssObj.id,
        updatedRssObj.blogImage,
      );
    } catch (error) {
      logger.error(`[${rssObj.rssUrl}] 채널 이미지 갱신 실패: ${error}`);
    }
  }
}
