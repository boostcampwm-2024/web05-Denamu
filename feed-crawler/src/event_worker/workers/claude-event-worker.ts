import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';
import Anthropic from '@anthropic-ai/sdk';
import { ClaudeResponse, FeedAIQueueItem } from '../../common/types';
import { TagMapRepository } from '../../repository/tag-map.repository';
import { FeedRepository } from '../../repository/feed.repository';
import logger from '../../common/logger';
import { InfoCodes, ErrorCodes, WarnCodes } from '../../common/log-codes';
import { PROMPT_CONTENT, redisConstant } from '../../common/constant';
import { RedisConnection } from '../../common/redis-access';
import { AbstractQueueWorker } from '../abstract-queue-worker';
import { DEPENDENCY_SYMBOLS } from '../../types/dependency-symbols';

@injectable()
export class ClaudeEventWorker extends AbstractQueueWorker<FeedAIQueueItem> {
  private readonly client: Anthropic;

  constructor(
    @inject(DEPENDENCY_SYMBOLS.TagMapRepository)
    private readonly tagMapRepository: TagMapRepository,
    @inject(DEPENDENCY_SYMBOLS.FeedRepository)
    private readonly feedRepository: FeedRepository,
    @inject(DEPENDENCY_SYMBOLS.RedisConnection)
    redisConnection: RedisConnection,
  ) {
    super('[AI Service]', redisConnection);
    this.client = new Anthropic({
      apiKey: process.env.AI_API_KEY,
    });
  }

  protected async processQueue(): Promise<void> {
    const feeds = await this.loadFeeds();
    if (feeds) {
      await Promise.all(feeds.map((feed) => this.processItem(feed)));
    }
  }

  protected getQueueKey(): string {
    return redisConstant.FEED_AI_QUEUE;
  }

  protected parseQueueMessage(message: string): FeedAIQueueItem {
    return JSON.parse(message);
  }

  protected async processItem(feed: FeedAIQueueItem): Promise<void> {
    try {
      const aiData = await this.requestAI(feed);
      await this.saveAIResult(aiData);
    } catch (error) {
      await this.handleFailure(feed, error as Error);
    }
  }

  private async loadFeeds() {
    try {
      const redisSearchResult = await this.redisConnection.executePipeline((pipeline) => {
        for (let i = 0; i < parseInt(process.env.AI_RATE_LIMIT_COUNT); i++) {
          pipeline.rpop(redisConstant.FEED_AI_QUEUE);
        }
      });
      return redisSearchResult
        .map((result) => JSON.parse(result[1] as string))
        .filter((value) => value !== null);
    } catch (error) {
      logger.error('Redis 데이터 파싱 오류', {
        code: ErrorCodes.FC_AI_REDIS_PARSE_ERROR,
        context: 'AIService',
        key: redisConstant.FEED_AI_QUEUE,
        stack: (error as Error).stack,
      });
      return null;
    }
  }

  private async requestAI(feed: FeedAIQueueItem) {
    logger.info(`AI 요청: feedId=${feed.id}`, {
      code: InfoCodes.FC_AI_REQUEST,
      context: 'AIService',
      feedId: feed.id,
    });

    const params: Anthropic.MessageCreateParams = {
      max_tokens: 8192,
      system: PROMPT_CONTENT,
      messages: [{ role: 'user', content: feed.content }],
      model: 'claude-3-5-haiku-latest',
    };
    const message = await this.client.messages.create(params);
    const responseText: string = message.content[0]['text'].replace(/[\n\r\t\s]+/g, ' ');

    logger.info(`AI 응답 수신: feedId=${feed.id}`, {
      code: InfoCodes.FC_AI_RESPONSE,
      context: 'AIService',
      feedId: feed.id,
      responseLength: responseText.length,
    });

    const responseObject: ClaudeResponse = JSON.parse(responseText);
    feed.summary = responseObject.summary;
    feed.tagList = Object.keys(responseObject.tags);

    return feed;
  }

  private async saveAIResult(feed: FeedAIQueueItem) {
    await this.tagMapRepository.insertTags(feed.id, feed.tagList);
    await this.redisConnection.hset(`feed:recent:${feed.id}`, 'tag', feed.tagList.join(','));
    await this.feedRepository.updateSummary(feed.id, feed.summary);
  }

  protected async handleFailure(feed: FeedAIQueueItem, error: Error): Promise<void> {
    const shouldRetry = this.isRetryableError(error);

    logger.error(`AI 처리 실패: feedId=${feed.id}`, {
      code: ErrorCodes.FC_AI_API_ERROR,
      context: 'AIService',
      feedId: feed.id,
      deathCount: feed.deathCount,
      retryable: shouldRetry,
      stack: error.stack,
    });

    if (shouldRetry && feed.deathCount < 3) {
      feed.deathCount++;
      await this.redisConnection.rpush(redisConstant.FEED_AI_QUEUE, [JSON.stringify(feed)]);

      logger.warn(`AI 요약 재시도 예약: feedId=${feed.id}`, {
        code: WarnCodes.FC_AI_SUMMARY_RETRY,
        context: 'AIService',
        feedId: feed.id,
        deathCount: feed.deathCount,
      });
    } else {
      const reason = shouldRetry ? 'Death Count 3회 초과' : `재시도 불가능한 에러 (${error.name})`;

      logger.error(`AI 요약 영구 실패: feedId=${feed.id}`, {
        code: ErrorCodes.FC_AI_SUMMARY_FAILURE,
        context: 'AIService',
        feedId: feed.id,
        deathCount: feed.deathCount,
        reason,
      });

      await this.feedRepository.updateNullSummary(feed.id);
    }
  }

  private isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();

    if (message.includes('invalid') || message.includes('401')) return false;
    if (message.includes('json') || message.includes('parse')) return false;
    if (message.includes('rate limit') || message.includes('429')) return true;
    if (message.includes('timeout') || message.includes('503')) return true;

    return true;
  }
}
