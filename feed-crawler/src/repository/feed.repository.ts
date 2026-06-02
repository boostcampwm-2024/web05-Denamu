import { inject, injectable } from 'tsyringe';

import { redisConstant } from '@common/constant';
import { DatabaseConnection } from '@common/database-connection';
import { DEPENDENCY_SYMBOLS } from '@common/dependency-symbols';
import logger from '@common/logger';
import { DbMetrics } from '@common/metrics/db-metrics';
import { RedisMetrics } from '@common/metrics/redis-metrics';
import { RedisConnection } from '@common/redis-access';
import { FeedDetail } from '@common/types';

@injectable()
export class FeedRepository {
  constructor(
    @inject(DEPENDENCY_SYMBOLS.DatabaseConnection)
    private readonly dbConnection: DatabaseConnection,
    @inject(RedisConnection)
    private readonly redisConnection: RedisConnection,
    @inject(DbMetrics)
    private readonly dbMetrics: DbMetrics,
    @inject(RedisMetrics)
    private readonly redisMetrics: RedisMetrics,
  ) {}

  public async insertFeeds(resultData: FeedDetail[]) {
    const query = `
            INSERT INTO feed (blog_id, created_at, title, path, thumbnail, summary)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

    const insertPromises = resultData.map(async (feed, index) => {
      this.dbMetrics.total.inc({ operation: 'insert_feed' });
      try {
        const result = await this.dbConnection.executeQueryStrict(query, [
          feed.blogId,
          feed.pubDate,
          feed.title,
          feed.link,
          feed.imageUrl,
          feed.summary,
        ]);
        this.dbMetrics.success.inc({ operation: 'insert_feed' });
        return { result, index, success: true };
      } catch (error) {
        const mysqlError = error as { code?: string };
        if (mysqlError.code === 'ER_DUP_ENTRY') {
          this.dbMetrics.duplicate.inc();
          logger.info(`중복 피드 스킵: ${feed.title} (${feed.link})`);
          return { result: null, index, success: false, duplicate: true };
        }
        this.dbMetrics.failure.inc({ operation: 'insert_feed' });
        throw error;
      }
    });

    const promiseResults = await Promise.all(insertPromises);

    const insertedFeeds = promiseResults
      .filter((result) => result.success)
      .map((result) => ({
        ...resultData[result.index],
        id: (result.result as unknown as { insertId: number }).insertId,
      }));

    const duplicateCount = promiseResults.filter(
      (result) => result.duplicate,
    ).length;

    logger.info(
      `[MySQL] ${
        insertedFeeds.length
      }개의 피드 데이터가 성공적으로 데이터베이스에 삽입되었습니다.${
        duplicateCount ? ' ' + duplicateCount + '개의 중복 피드 발생' : ''
      }`,
    );

    return insertedFeeds;
  }

  async deleteRecentFeed() {
    this.redisMetrics.total.inc({ operation: 'delete_recent' });
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
      this.redisMetrics.success.inc({ operation: 'delete_recent' });
      logger.info(`[Redis] 최근 게시글 캐시가 정상적으로 삭제되었습니다.`);
    } catch (error) {
      this.redisMetrics.failure.inc({ operation: 'delete_recent' });
      logger.error(
        `[Redis] 최근 게시글 캐시를 삭제하는 도중 에러가 발생했습니다.
        에러 메시지: ${error instanceof Error ? error.message : String(error)}
        스택 트레이스: ${error instanceof Error ? error.stack : ''}`,
      );
    }
  }

  async setRecentFeedList(feedLists: FeedDetail[]) {
    this.redisMetrics.total.inc({ operation: 'cache_feeds' });
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
      this.redisMetrics.success.inc({ operation: 'cache_feeds' });
      logger.info(`[Redis] 최근 게시글 캐시가 정상적으로 저장되었습니다.`);
    } catch (error) {
      this.redisMetrics.failure.inc({ operation: 'cache_feeds' });
      logger.error(
        `[Redis] 최근 게시글 캐시를 저장하는 도중 에러가 발생했습니다.
        에러 메시지: ${error instanceof Error ? error.message : String(error)}
        스택 트레이스: ${error instanceof Error ? error.stack : ''}`,
      );
    }
  }

  public async updateSummary(feedId: number, summary: string) {
    const query = `
              UPDATE feed
              SET summary=?
              WHERE id=?
          `;
    this.dbMetrics.total.inc({ operation: 'update_summary' });
    try {
      await this.dbConnection.executeQuery(query, [summary, feedId]);
      this.dbMetrics.success.inc({ operation: 'update_summary' });
    } catch (error) {
      this.dbMetrics.failure.inc({ operation: 'update_summary' });
      throw error;
    }
  }

  public async updateNullSummary(feedId: number) {
    const query = `
          UPDATE feed
          SET summary=NULL
          WHERE id=?`;
    this.dbMetrics.total.inc({ operation: 'update_null_summary' });
    try {
      await this.dbConnection.executeQuery(query, [feedId]);
      this.dbMetrics.success.inc({ operation: 'update_null_summary' });
    } catch (error) {
      this.dbMetrics.failure.inc({ operation: 'update_null_summary' });
      throw error;
    }
  }

  async saveAiQueue(feedLists: FeedDetail[]) {
    this.redisMetrics.total.inc({ operation: 'enqueue_ai' });
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
      this.redisMetrics.success.inc({ operation: 'enqueue_ai' });
      logger.info(`[Redis] AI Queue 데이터 삽입이 정상적으로 수행되었습니다.`);
    } catch (error) {
      this.redisMetrics.failure.inc({ operation: 'enqueue_ai' });
      logger.error(
        `[Redis] AI Queue 데이터 삽입 중 에러가 발생했습니다.
        에러 메시지: ${error instanceof Error ? error.message : String(error)}
        스택 트레이스: ${error instanceof Error ? error.stack : ''}`,
      );
    }
  }
}
