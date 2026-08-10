import { inject, injectable } from 'tsyringe';

import Anthropic from '@anthropic-ai/sdk';

import { buildPromptContent } from '@common/ai/ai.constant';
import { ClaudeResponse, FeedAIQueueItem } from '@common/ai/ai.type';
import { RetryableError } from '@common/errors';
import logger from '@common/logger/logger';
import { AiMetrics } from '@common/metrics/ai-metrics';
import { RedisMetrics } from '@common/metrics/redis-metrics';
import { RedisConnection } from '@common/redis/redis-access';
import { redisConstant } from '@common/redis/redis.constant';

import { AbstractQueueWorker } from '@event_worker/abstract-queue-worker';

import { FeedRepository } from '@repository/feed.repository';
import { TagRepository } from '@repository/tag.repository';
import { TagMapRepository } from '@repository/tag-map.repository';

@injectable()
export class ClaudeEventWorker extends AbstractQueueWorker<FeedAIQueueItem> {
  private readonly client: Anthropic;
  private promptContent: string | null = null;

  constructor(
    @inject(TagMapRepository)
    private readonly tagMapRepository: TagMapRepository,
    @inject(TagRepository)
    private readonly tagRepository: TagRepository,
    @inject(FeedRepository)
    private readonly feedRepository: FeedRepository,
    @inject(RedisConnection)
    redisConnection: RedisConnection,
    @inject(AiMetrics)
    private readonly aiMetrics: AiMetrics,
    @inject(RedisMetrics)
    private readonly redisMetrics: RedisMetrics,
  ) {
    super('[AI Service]', redisConnection);
    this.client = new Anthropic({
      apiKey: process.env.AI_API_KEY,
    });
  }

  protected async processQueue(): Promise<void> {
    const depth = await this.redisConnection.llen(redisConstant.FEED_AI_QUEUE);
    this.aiMetrics.queueDepth.set(depth);
    const feeds = await this.loadFeeds();
    await Promise.all(feeds.map((feed) => this.processItem(feed)));
  }

  protected getQueueKey(): string {
    return redisConstant.FEED_AI_QUEUE;
  }

  protected parseQueueMessage(message: string) {
    return JSON.parse(message) as FeedAIQueueItem;
  }

  protected async processItem(feed: FeedAIQueueItem): Promise<void> {
    try {
      const aiData = await this.requestAI(feed);
      await this.saveAIResult(aiData);
      await this.releaseRetryLock(feed.id);
    } catch (error) {
      await this.handleFailure(feed, error as Error);
    }
  }

  private async loadFeeds(): Promise<FeedAIQueueItem[]> {
    this.redisMetrics.total.inc({ operation: 'load_feeds' });
    try {
      const redisSearchResult = (await this.redisConnection.executePipeline(
        (pipeline) => {
          for (let i = 0; i < parseInt(process.env.AI_RATE_LIMIT_COUNT); i++) {
            pipeline.rpop(redisConstant.FEED_AI_QUEUE);
          }
        },
      )) as [error: Error, result: string | null][];
      const result = redisSearchResult
        .map(([, raw]) => this.safeParseFeed(raw))
        .filter((value): value is FeedAIQueueItem => value !== null);
      this.redisMetrics.success.inc({ operation: 'load_feeds' });
      return result;
    } catch (error) {
      this.redisMetrics.failure.inc({ operation: 'load_feeds' });
      logger.error(`${this.nameTag} Redis 큐 로드 실패:
        메시지: ${error instanceof Error ? error.message : String(error)}
        스택 트레이스: ${error instanceof Error ? error.stack : ''}
      `);
      return [];
    }
  }

  private safeParseFeed(raw: string | null): FeedAIQueueItem | null {
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as FeedAIQueueItem;
    } catch (error) {
      logger.warn(
        `${this.nameTag} AI 큐 메시지 파싱 실패(스킵): ${error instanceof Error ? error.message : String(error)} | raw=${raw.slice(0, 200)}`,
      );
      return null;
    }
  }

  private async getPromptContent(): Promise<string> {
    if (this.promptContent === null) {
      const allowedTags = await this.tagRepository.findAllNames();
      this.promptContent = buildPromptContent(allowedTags);
    }
    return this.promptContent;
  }

  private async requestAI(feed: FeedAIQueueItem) {
    logger.info(`${this.nameTag} AI 요청: ${JSON.stringify(feed)}`);
    this.aiMetrics.total.inc();
    const endTimer = this.aiMetrics.duration.startTimer();
    try {
      const params: Anthropic.MessageCreateParams = {
        max_tokens: 8192,
        system: [
          {
            type: 'text',
            text: await this.getPromptContent(),
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{ role: 'user', content: feed.content }],
        model: 'claude-haiku-4-5',
      };
      const message = await this.client.messages.create(params);
      const responseText = message.content[0]['text'];
      logger.info(`${this.nameTag} ${feed.id} AI 요청 응답: ${responseText}`);

      const responseObject = this.parseClaudeResponse(responseText);
      feed.summary = responseObject.summary;
      feed.tagList = Object.keys(responseObject.tags);

      this.aiMetrics.success.inc();
      endTimer();
      return feed;
    } catch (error) {
      this.aiMetrics.failure.inc();
      endTimer();
      throw error;
    }
  }

  private parseClaudeResponse(responseText: string) {
    const cleanedText = responseText
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    const jsonStart = cleanedText.indexOf('{');
    const jsonEnd = cleanedText.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1 || jsonStart > jsonEnd) {
      throw new RetryableError(
        `AI 응답이 json으로 반환되지 않았습니다: ${cleanedText.slice(0, 200)}`,
      );
    }

    const jsonText = cleanedText.slice(jsonStart, jsonEnd + 1);
    return JSON.parse(jsonText) as ClaudeResponse;
  }

  private async saveAIResult(feed: FeedAIQueueItem) {
    await this.tagMapRepository.insertTags(feed.id, feed.tagList);
    this.redisMetrics.total.inc({ operation: 'save_ai_result' });
    try {
      await this.redisConnection.hset(
        `feed:recent:${feed.id}`,
        'tag',
        feed.tagList.join(','),
      );
      this.redisMetrics.success.inc({ operation: 'save_ai_result' });
    } catch (error) {
      this.redisMetrics.failure.inc({ operation: 'save_ai_result' });
      throw error;
    }
    await this.feedRepository.updateSummary(feed.id, feed.summary);
  }

  protected getRetryQueueKey(): string {
    return redisConstant.FEED_AI_QUEUE;
  }

  protected getItemLabel(feed: FeedAIQueueItem): string {
    return String(feed.id);
  }

  protected async pushToRetryQueue(feed: FeedAIQueueItem): Promise<void> {
    this.redisMetrics.total.inc({ operation: 'retry_queue' });
    try {
      await super.pushToRetryQueue(feed);
      this.redisMetrics.success.inc({ operation: 'retry_queue' });
    } catch (error) {
      this.redisMetrics.failure.inc({ operation: 'retry_queue' });
      throw error;
    }
  }

  protected async onPermanentFailure(feed: FeedAIQueueItem): Promise<void> {
    this.aiMetrics.permanentFailure.inc();
    await this.feedRepository.updateNullSummary(feed.id);
    await this.releaseRetryLock(feed.id);
  }

  private async releaseRetryLock(feedId: number): Promise<void> {
    try {
      await this.redisConnection.del(
        `${redisConstant.FEED_AI_RETRY_LOCK}:${feedId}`,
      );
    } catch (error) {
      logger.error(
        `${this.nameTag} ${feedId} AI 재요청 락 해제 실패: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
