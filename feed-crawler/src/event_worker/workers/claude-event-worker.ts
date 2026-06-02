import { inject, injectable } from 'tsyringe';

import Anthropic from '@anthropic-ai/sdk';

import { PROMPT_CONTENT, redisConstant } from '@common/constant';
import { DEPENDENCY_SYMBOLS } from '@common/dependency-symbols';
import logger from '@common/logger';
import { AiMetrics } from '@common/metrics/ai-metrics';
import { RedisMetrics } from '@common/metrics/redis-metrics';
import { NOTIFICATION_EVENT } from '@common/notification/notification-event.constant';
import { Notifier } from '@common/notification/notifier.interface';
import { RedisConnection } from '@common/redis-access';
import { ClaudeResponse, FeedAIQueueItem } from '@common/types';

import { AbstractQueueWorker } from '@event_worker/abstract-queue-worker';

import { FeedRepository } from '@repository/feed.repository';
import { TagMapRepository } from '@repository/tag-map.repository';

@injectable()
export class ClaudeEventWorker extends AbstractQueueWorker<FeedAIQueueItem> {
  private readonly client: Anthropic;

  constructor(
    @inject(TagMapRepository)
    private readonly tagMapRepository: TagMapRepository,
    @inject(FeedRepository)
    private readonly feedRepository: FeedRepository,
    @inject(RedisConnection)
    redisConnection: RedisConnection,
    @inject(DEPENDENCY_SYMBOLS.Notifier)
    private readonly notifier: Notifier,
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
    } catch (error) {
      await this.handleFailure(feed, error as Error);
      this.notifier.publish(NOTIFICATION_EVENT.AI_SUMMARY, {
        error: error as Error,
        feedId: feed.id,
        errorSource: '[AI 요약 요청]',
      });
    }
  }

  private async loadFeeds() {
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
        .map((result) => JSON.parse(result[1]))
        .filter((value) => value !== null);
      this.redisMetrics.success.inc({ operation: 'load_feeds' });
      return result;
    } catch (error) {
      this.redisMetrics.failure.inc({ operation: 'load_feeds' });
      logger.error(`${this.nameTag} Redis 로드한 데이터 JSON Parse 중 오류 발생:
        메시지: ${error instanceof Error ? error.message : String(error)}
        스택 트레이스: ${error instanceof Error ? error.stack : ''}
      `);
    }
  }

  private async requestAI(feed: FeedAIQueueItem) {
    logger.info(`${this.nameTag} AI 요청: ${JSON.stringify(feed)}`);
    this.aiMetrics.total.inc();
    const endTimer = this.aiMetrics.duration.startTimer();
    try {
      const params: Anthropic.MessageCreateParams = {
        max_tokens: 8192,
        system: PROMPT_CONTENT,
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
      throw new Error(
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
      this.redisMetrics.total.inc({ operation: 'retry_queue' });
      try {
        await this.redisConnection.rpush(redisConstant.FEED_AI_QUEUE, [
          JSON.stringify(feed),
        ]);
        this.redisMetrics.success.inc({ operation: 'retry_queue' });
      } catch (error) {
        this.redisMetrics.failure.inc({ operation: 'retry_queue' });
        throw error;
      }
      logger.warn(
        `${this.nameTag} ${feed.id} 재시도 예약 (${feed.deathCount}/3)`,
      );
    } else {
      const reason = shouldRetry
        ? `Death Count 3회 초과`
        : `재시도 불가능한 에러 (${error.name})`;
      logger.error(`${this.nameTag} ${feed.id} 영구 실패 - ${reason}`);
      this.aiMetrics.permanentFailure.inc();
      await this.feedRepository.updateNullSummary(feed.id);
    }
  }

  private isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();

    // 재시도하면 안 되는 케이스 (영구적 에러)
    if (
      message.includes('invalid') ||
      message.includes('401') ||
      message.includes('404')
    ) {
      return false;
    }
    if (message.includes('json') || message.includes('parse')) {
      return false;
    }

    // 재시도해야 하는 케이스 (일시적 에러)
    if (message.includes('rate limit') || message.includes('429')) {
      return true;
    }
    if (message.includes('timeout') || message.includes('503')) {
      return true;
    }

    // 기본값: 재시도
    return true;
  }
}
