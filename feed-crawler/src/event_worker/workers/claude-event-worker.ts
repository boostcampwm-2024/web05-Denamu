import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';
import Anthropic from '@anthropic-ai/sdk';
import { ClaudeResponse, FeedAIQueueItem } from '@common/types';
import { TagMapRepository } from '@repository/tag-map.repository';
import { FeedRepository } from '@repository/feed.repository';
import logger from '@common/logger';
import { PROMPT_CONTENT, redisConstant } from '@common/constant';
import { RedisConnection } from '@common/redis-access';
import { AbstractQueueWorker } from '@event_worker/abstract-queue-worker';
import { DEPENDENCY_SYMBOLS } from '@app-types/dependency-symbols';

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
    await Promise.all(feeds.map((feed) => this.processItem(feed)));
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
      await this.handleFailure(feed, error);
    }
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

  private async requestAI(feed: FeedAIQueueItem) {
    logger.info(`${this.nameTag} AI 요청: ${JSON.stringify(feed)}`);
    const params: Anthropic.MessageCreateParams = {
      max_tokens: 8192,
      system: PROMPT_CONTENT,
      messages: [{ role: 'user', content: feed.content }],
      model: 'claude-3-5-haiku-latest',
    };
    const message = await this.client.messages.create(params);
    const responseText: string = message.content[0]['text'].replace(
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

  protected async handleFailure(
    feed: FeedAIQueueItem,
    error: Error,
  ): Promise<void> {
    const shouldRetry = this.isRetryableError(error);

    logger.error(
      `${this.nameTag} ${feed.id} 처리 실패:
      - 에러: ${error.name} - ${error.message}
      - 재시도 가능: ${shouldRetry}
      - 현재 deathCount: ${feed.deathCount}`,
    );

    if (shouldRetry && feed.deathCount < 3) {
      feed.deathCount++;
      await this.redisConnection.rpush(redisConstant.FEED_AI_QUEUE, [
        JSON.stringify(feed),
      ]);
      logger.warn(
        `${this.nameTag} ${feed.id} 재시도 예약 (${feed.deathCount}/3)`,
      );
    } else {
      const reason = shouldRetry
        ? `Death Count 3회 초과`
        : `재시도 불가능한 에러 (${error.name})`;
      logger.error(`${this.nameTag} ${feed.id} 영구 실패 - ${reason}`);
      await this.feedRepository.updateNullSummary(feed.id);
    }
  }

  private isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();

    // 재시도하면 안 되는 케이스 (영구적 에러)
    if (message.includes('invalid') || message.includes('401')) return false;
    if (message.includes('json') || message.includes('parse')) return false;

    // 재시도해야 하는 케이스 (일시적 에러)
    if (message.includes('rate limit') || message.includes('429')) return true;
    if (message.includes('timeout') || message.includes('503')) return true;

    // 기본값: 재시도
    return true;
  }
}
