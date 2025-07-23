import 'reflect-metadata';
import { injectable } from 'tsyringe';
import Anthropic from '@anthropic-ai/sdk';
import { ClaudeResponse, FeedAIQueueItem } from './common/types';
import { TagMapRepository } from './repository/tag-map.repository';
import { FeedRepository } from './repository/feed.repository';
import logger from './common/logger';
import { PROMPT_CONTENT, redisConstant } from './common/constant';
import { RedisConnection } from './common/redis-access';

@injectable()
export class ClaudeService {
  private readonly client: Anthropic;
  private readonly nameTag: string;

  constructor(
    private readonly tagMapRepository: TagMapRepository,
    private readonly feedRepository: FeedRepository,
    private readonly redisConnection: RedisConnection,
  ) {
    this.client = new Anthropic({
      apiKey: process.env.AI_API_KEY,
    });
    this.nameTag = '[AI Service]';
  }

  async startRequestAI() {
    const feeds = await this.loadFeeds();
    await Promise.all(feeds.map((feed) => this.processFeed(feed)));
  }

  private async loadFeeds() {
    try {
      const redisSearchResult = await this.redisConnection.executePipeline(
        (pipeline) => {
          for (let i = 0; i < parseInt(process.env.AI_RATE_LIMIT_COUNT); i++) {
            pipeline.rpop(redisConstant.FEED_AI_QUEUE);
          }
        },
      );
      return redisSearchResult
        .map((result) => JSON.parse(result[1] as string))
        .filter((value) => value !== null);
    } catch (error) {
      logger.error(`${this.nameTag} Redis 로드한 데이터 JSON Parse 중 오류 발생:
        메시지: ${error.message}
        스택 트레이스: ${error.stack}
      `);
    }
  }

  private async processFeed(feed: FeedAIQueueItem) {
    try {
      const aiData = await this.requestAI(feed);
      await this.saveAIResult(aiData);
    } catch (error) {
      logger.error(
        `${this.nameTag} ${feed.id} 처리 중 에러 발생: ${error.message}`,
        error.stack,
      );
      await this.handleFailure(feed, error);
    }
  }

  private async requestAI(feed: FeedAIQueueItem) {
    logger.info(`${this.nameTag} AI 요청: ${JSON.stringify(feed)}`);
    const params: Anthropic.MessageCreateParams = {
      max_tokens: 8192,
      system: PROMPT_CONTENT,
      messages: [{ role: 'user', content: feed.content }],
      model: 'claude-3-5-haiku-latest',
    };
    const message = await this.client.messages.create(params);
    let responseText: string = message.content[0]['text'].replace(
      /[\n\r\t\s]+/g,
      ' ',
    );
    logger.info(`${this.nameTag} ${feed.id} AI 요청 응답: ${responseText}`);
    const responseObject: ClaudeResponse = JSON.parse(responseText);
    feed.summary = responseObject.summary;
    feed.tagList = Object.keys(responseObject.tags);

    return feed;
  }

  private async saveAIResult(feed: FeedAIQueueItem) {
    await this.tagMapRepository.insertTags(feed.id, feed.tagList);
    await this.redisConnection.hset(
      `feed:recent:${feed.id}`,
      'tag',
      feed.tagList.join(','),
    );
    await this.feedRepository.updateSummary(feed.id, feed.summary);
  }

  private async handleFailure(feed: FeedAIQueueItem, e: Error) {
    if (feed.deathCount < 3) {
      feed.deathCount++;
      await this.redisConnection.rpush(redisConstant.FEED_AI_QUEUE, [
        JSON.stringify(feed),
      ]);
      logger.warn(`${this.nameTag} ${feed.id} 재시도 (${feed.deathCount})`);
    } else {
      logger.error(
        `${this.nameTag} ${feed.id} 의 Death Count 3회 이상 발생 AI 요청 금지`,
      );
      await this.feedRepository.updateNullSummary(feed.id);
    }
  }
}
