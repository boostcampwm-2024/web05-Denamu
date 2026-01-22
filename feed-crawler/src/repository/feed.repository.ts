import { FeedDetail } from '../common/types';
import logger from '../common/logger';
import { InfoCodes, ErrorCodes } from '../common/log-codes';
import { redisConstant } from '../common/constant';
import { RedisConnection } from '../common/redis-access';
import { inject, injectable } from 'tsyringe';
import { DEPENDENCY_SYMBOLS } from '../types/dependency-symbols';
import { DatabaseConnection } from '../types/database-connection';

@injectable()
export class FeedRepository {
  constructor(
    @inject(DEPENDENCY_SYMBOLS.DatabaseConnection)
    private readonly dbConnection: DatabaseConnection,
    @inject(DEPENDENCY_SYMBOLS.RedisConnection)
    private readonly redisConnection: RedisConnection,
  ) {}

  public async insertFeeds(resultData: FeedDetail[]) {
    const query = `
      INSERT INTO feed (blog_id, created_at, title, path, thumbnail, summary)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const insertPromises = resultData.map(async (feed, index) => {
      try {
        const result = await this.dbConnection.executeQueryStrict(query, [
          feed.blogId,
          feed.pubDate,
          feed.title,
          feed.link,
          feed.imageUrl,
          feed.summary,
        ]);
        return { result, index, success: true };
      } catch (error) {
        if ((error as any).code === 'ER_DUP_ENTRY') {
          logger.info(`중복 피드 스킵: ${feed.title}`, {
            code: InfoCodes.FC_FEED_DUPLICATE_SKIP,
            context: 'FeedRepository',
            feedUrl: feed.link,
          });
          return { result: null, index, success: false, duplicate: true };
        }
        throw error;
      }
    });

    const promiseResults = await Promise.all(insertPromises);

    const insertedFeeds = promiseResults
      .filter((result) => result.success)
      .map((result) => ({
        ...resultData[result.index],
        id: result.result.insertId,
      }));

    const duplicateCount = promiseResults.filter((result) => result.duplicate).length;

    logger.info(`피드 저장 완료: ${insertedFeeds.length}개`, {
      code: InfoCodes.FC_FEED_COUNT,
      context: 'FeedRepository',
      insertedCount: insertedFeeds.length,
      duplicateCount,
    });

    return insertedFeeds;
  }

  async deleteRecentFeed() {
    try {
      const keysToDelete = [];
      let cursor = '0';
      do {
        const [newCursor, keys] = await this.redisConnection.scan(
          cursor,
          redisConstant.FEED_RECENT_ALL_KEY,
          100,
        );
        keysToDelete.push(...keys);
        cursor = newCursor;
      } while (cursor !== '0');

      if (keysToDelete.length > 0) {
        await this.redisConnection.del(...keysToDelete);
      }

      logger.info('캐시 삭제 성공', {
        code: InfoCodes.FC_CACHE_DELETE_SUCCESS,
        context: 'CacheService',
        key: 'feed:recent:*',
        deletedCount: keysToDelete.length,
      });
    } catch (error) {
      logger.error('캐시 삭제 실패', {
        code: ErrorCodes.FC_CACHE_DELETE_ERROR,
        context: 'CacheService',
        key: 'feed:recent:*',
        stack: (error as Error).stack,
      });
    }
  }

  async setRecentFeedList(feedLists: FeedDetail[]) {
    try {
      await this.redisConnection.executePipeline((pipeline) => {
        for (const feed of feedLists) {
          pipeline.hset(`feed:recent:${feed.id}`, {
            id: feed.id,
            blogPlatform: feed.blogPlatform,
            createdAt: feed.pubDate,
            viewCount: 0,
            blogName: feed.blogName,
            thumbnail: feed.imageUrl,
            path: feed.link,
            title: feed.title,
            tag: Array.isArray(feed.tag) ? feed.tag : [],
            likes: 0,
            comments: 0,
          });
        }
      });

      logger.info('캐시 저장 성공', {
        code: InfoCodes.FC_CACHE_SAVE_SUCCESS,
        context: 'CacheService',
        key: 'feed:recent:*',
        count: feedLists.length,
      });
    } catch (error) {
      logger.error('캐시 저장 실패', {
        code: ErrorCodes.FC_CACHE_SAVE_ERROR,
        context: 'CacheService',
        key: 'feed:recent:*',
        stack: (error as Error).stack,
      });
    }
  }

  public async updateSummary(feedId: number, summary: string) {
    const query = `
      UPDATE feed
      SET summary=?
      WHERE id=?
    `;
    await this.dbConnection.executeQuery(query, [summary, feedId]);
  }

  public async updateNullSummary(feedId: number) {
    const query = `
      UPDATE feed
      SET summary=NULL
      WHERE id=?
    `;
    await this.dbConnection.executeQuery(query, [feedId]);
  }

  async saveAiQueue(feedLists: FeedDetail[]) {
    try {
      await this.redisConnection.executePipeline((pipeline) => {
        for (const feed of feedLists) {
          pipeline.lpush(
            redisConstant.FEED_AI_QUEUE,
            JSON.stringify({
              id: feed.id,
              content: feed.content,
              deathCount: feed.deathCount,
            }),
          );
        }
      });

      logger.info(`AI Queue 푸시 성공: ${feedLists.length}개`, {
        code: InfoCodes.FC_QUEUE_PUSH_SUCCESS,
        context: 'QueueService',
        count: feedLists.length,
      });
    } catch (error) {
      logger.error('AI Queue 푸시 실패', {
        code: ErrorCodes.FC_QUEUE_PUSH_ERROR,
        context: 'QueueService',
        stack: (error as Error).stack,
      });
    }
  }
}
