import { inject, injectable } from 'tsyringe';

import { DatabaseConnection } from '@common/database/database-connection';
import { DEPENDENCY_SYMBOLS } from '@common/dependency-symbols';
import { FeedDetail } from '@common/feed/feed.type';
import logger from '@common/logger/logger';
import { DbMetrics } from '@common/metrics/db-metrics';
import { RedisMetrics } from '@common/metrics/redis-metrics';
import { RedisConnection } from '@common/redis/redis-access';
import { redisConstant } from '@common/redis/redis.constant';
import {
  FeedAiQueueMessage,
  FeedRecentRedisRecord,
} from '@common/redis/redis.type';

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
    this.dbMetrics.total.inc({ operation: 'insert_feed' }, resultData.length);

    const paths = resultData.map((feed) => feed.link);
    let existing: { path: string }[];

    try {
      existing = await this.dbConnection.executeQueryStrict<{
        path: string;
      }>(`SELECT path FROM feed WHERE path IN (?)`, [paths]);
    } catch (error) {
      this.dbMetrics.failure.inc(
        { operation: 'insert_feed' },
        resultData.length,
      );
      throw error;
    }

    const existingPaths = new Set(existing.map((row) => row.path));
    const seenPaths = new Set<string>();
    const candidates = resultData.filter((feed) => {
      if (existingPaths.has(feed.link) || seenPaths.has(feed.link)) {
        return false;
      }
      seenPaths.add(feed.link);
      return true;
    });

    let insertedFeeds: FeedDetail[] = [];
    if (candidates.length > 0) {
      const insertQuery = `
            INSERT IGNORE INTO feed (blog_id, created_at, title, path, thumbnail, summary)
            VALUES ?
        `;
      const values = candidates.map((feed) => [
        feed.blog.id,
        feed.pubDate,
        feed.title,
        feed.link,
        feed.thumbnail,
        feed.summary,
      ]);

      try {
        await this.dbConnection.executeQueryStrict(insertQuery, [values]);

        const candidatePaths = candidates.map((feed) => feed.link);
        const inserted = await this.dbConnection.executeQueryStrict<{
          id: number;
          path: string;
        }>(`SELECT id, path FROM feed WHERE path IN (?)`, [candidatePaths]);
        const idByPath = new Map(inserted.map((row) => [row.path, row.id]));

        insertedFeeds = candidates
          .filter((feed) => idByPath.has(feed.link))
          .map((feed) => ({ ...feed, id: idByPath.get(feed.link) }));
      } catch (error) {
        logger.error(
          `[MySQL] Bulk 방식으로 삽입 실패, 행 단위 재시도로 폴백합니다.
          에러 메시지: ${error instanceof Error ? error.message : String(error)}`,
        );
        insertedFeeds = await this.insertFeedsIndividually(candidates);
      }
    }

    const duplicateCount = resultData.length - insertedFeeds.length;
    this.dbMetrics.success.inc(
      { operation: 'insert_feed' },
      insertedFeeds.length,
    );
    if (duplicateCount > 0) {
      this.dbMetrics.duplicate.inc(duplicateCount);
    }

    logger.info(
      `[MySQL] ${
        insertedFeeds.length
      }개의 피드 데이터가 성공적으로 데이터베이스에 삽입되었습니다.${
        duplicateCount ? ' ' + duplicateCount + '개의 중복 피드 발생' : ''
      }`,
    );

    return insertedFeeds;
  }

  private async insertFeedsIndividually(
    candidates: FeedDetail[],
  ): Promise<FeedDetail[]> {
    const insertQuery = `
            INSERT INTO feed (blog_id, created_at, title, path, thumbnail, summary)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

    const results = await Promise.all(
      candidates.map(async (feed) => {
        try {
          const result = await this.dbConnection.executeQueryStrict(
            insertQuery,
            [
              feed.blog.id,
              feed.pubDate,
              feed.title,
              feed.link,
              feed.thumbnail,
              feed.summary,
            ],
          );
          const insertId = (result as unknown as { insertId: number }).insertId;
          return { ...feed, id: insertId };
        } catch (error) {
          const mysqlError = error as { code?: string };
          if (mysqlError.code !== 'ER_DUP_ENTRY') {
            this.dbMetrics.failure.inc({ operation: 'insert_feed' });
            logger.error(
              `[MySQL] 개별 삽입 재시도 실패: ${feed.title} (${feed.link})
              에러 메시지: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
          return null;
        }
      }),
    );

    return results.filter((feed) => feed !== null);
  }

  async deleteRecentFeed() {
    this.redisMetrics.total.inc({ operation: 'delete_recent' });
    try {
      const trackedKeys = await this.redisConnection.smembers(
        redisConstant.FEED_RECENT_INDEX_KEY,
      );

      if (trackedKeys.length > 0) {
        await this.redisConnection.del(
          ...trackedKeys,
          redisConstant.FEED_RECENT_INDEX_KEY,
        );
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
          const record: FeedRecentRedisRecord = {
            id: feed.id,
            blogPlatform: feed.blog.platform,
            blogImage: feed.blog.image ?? '',
            createdAt: feed.pubDate,
            viewCount: 0,
            blogName: feed.blog.name,
            thumbnail: feed.thumbnail,
            path: feed.link,
            title: feed.title,
            tagList: Array.isArray(feed.tag) ? feed.tag : [],
            likes: 0,
            comments: 0,
          };
          pipeline.hset(`feed:recent:${feed.id}`, record);
          pipeline.sadd(
            redisConstant.FEED_RECENT_INDEX_KEY,
            `feed:recent:${feed.id}`,
          );
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

  public async selectFeedById(
    feedId: number,
  ): Promise<{ id: number; blogId: number; path: string } | null> {
    const query = `SELECT id, blog_id as blogId, path FROM feed WHERE id = ?`;
    this.dbMetrics.total.inc({ operation: 'select_feed_by_id' });
    try {
      const result = await this.dbConnection.executeQuery<{
        id: number;
        blogId: number;
        path: string;
      }>(query, [feedId]);
      this.dbMetrics.success.inc({ operation: 'select_feed_by_id' });
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      this.dbMetrics.failure.inc({ operation: 'select_feed_by_id' });
      throw error;
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
          const message: FeedAiQueueMessage = {
            id: feed.id,
            content: feed.content,
            deathCount: feed.deathCount,
          };
          pipeline.lpush(redisConstant.FEED_AI_QUEUE, JSON.stringify(message));
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
