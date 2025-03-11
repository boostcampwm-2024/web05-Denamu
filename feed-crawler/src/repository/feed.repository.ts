import { FeedDetail } from '../common/types';
import logger from '../common/logger';
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
    private readonly redisConnection: RedisConnection
  ) {}

  public async insertFeeds(resultData: FeedDetail[]) {
    const query = `
            INSERT INTO feed (blog_id, created_at, title, path, thumbnail, summary)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

    const insertPromises = resultData.map(async (feed) => {
      return this.dbConnection.executeQuery(query, [
        feed.blogId,
        feed.pubDate,
        feed.title,
        feed.link,
        feed.imageUrl,
        feed.summary,
      ]);
    });

    const promiseResults = await Promise.all(insertPromises);

    const insertedFeeds = promiseResults
      .map((feed: any, index) => {
        if (feed) {
          const insertId = feed.insertId;
          return {
            ...resultData[index],
            id: insertId,
          };
        }
      })
      .filter((feed) => feed);

    logger.info(
      `[MySQL] ${insertedFeeds.length}개의 피드 데이터가 성공적으로 데이터베이스에 삽입되었습니다.`
    );
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
          100
        );
        keysToDelete.push(...keys);
        cursor = newCursor;
      } while (cursor !== '0');

      if (keysToDelete.length > 0) {
        await this.redisConnection.del(...keysToDelete);
      }
      logger.info(`[Redis] 최근 게시글 캐시가 정상적으로 삭제되었습니다.`);
    } catch (error) {
      logger.error(
        `[Redis] 최근 게시글 캐시를 삭제하는 도중 에러가 발생했습니다.
        에러 메시지: ${error.message}
        스택 트레이스: ${error.stack}`
      );
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
          });
        }
      });
      logger.info(`[Redis] 최근 게시글 캐시가 정상적으로 저장되었습니다.`);
    } catch (error) {
      logger.error(
        `[Redis] 최근 게시글 캐시를 저장하는 도중 에러가 발생했습니다.
        에러 메시지: ${error.message}
        스택 트레이스: ${error.stack}`
      );
    }
  }

  public updateSummary(feedId: number, summary: string) {
    const query = `
              UPDATE feed 
              SET summary=?
              WHERE id=?
          `;

    this.dbConnection.executeQuery(query, [summary, feedId]);
  }

  public updateNullSummary(feedId: number) {
    const query = `
          UPDATE feed
          SET summary=NULL
          WHERE id=?`;
    this.dbConnection.executeQuery(query, [feedId]);
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
    } catch (error) {
      logger.error(
        `[Redis] AI Queue 데이터 삽입 중 에러가 발생했습니다.
        에러 메시지: ${error.message}
        스택 트레이스: ${error.stack}`,
      );
    }
    logger.info(`[Redis] AI Queue 데이터 삽입이 정상적으로 수행되었습니다.`);
  }
}
