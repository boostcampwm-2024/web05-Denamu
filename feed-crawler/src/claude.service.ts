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
    const feedList: FeedAIQueueItem[] = await this.loadFeeds();
    const feedListWithAI = await this.requestAI(feedList);
    await Promise.all([
      this.insertTag(feedListWithAI),
      this.updateSummary(feedListWithAI),
    ]);
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
      const feedObjectList: FeedAIQueueItem[] = redisSearchResult
        .map((result) => JSON.parse(result[1] as string))
        .filter((value) => value !== null);
      return feedObjectList;
    } catch (error) {
      logger.error(`${this.nameTag} Redis 로드한 데이터 JSON Parse 중 오류 발생:
        메시지: ${error.message}
        스택 트레이스: ${error.stack}
      `);
    }
  }

  private async requestAI(feeds: FeedAIQueueItem[]) {
    const feedsWithAIData = await Promise.all(
      feeds.map(async (feed) => {
        try {
          logger.info(`${this.nameTag} AI 요청: ${JSON.stringify(feed)}`);
          const params: Anthropic.MessageCreateParams = {
            max_tokens: 8192,
            system: PROMPT_CONTENT,
            messages: [{ role: 'user', content: feed.content }],
            model: 'claude-3-5-haiku-latest',
          };
          const message = await this.client.messages.create(params);
          let responseText: string = message.content[0]['text'];
          responseText = responseText.replace(/[\n\r\t\s]+/g, ' ');
          logger.info(
            `${this.nameTag} ${feed.id} AI 요청 응답: ${responseText}`,
          );
          const responseObject: ClaudeResponse = JSON.parse(responseText);
          feed.summary = responseObject.summary;
          feed.tagList = Object.keys(responseObject.tags);
          return feed;
        } catch (error) {
          logger.error(
            `${this.nameTag} ${feed.id}의 태그 생성, 컨텐츠 요약 에러 발생: 
          메시지: ${error.message}
          스택 트레이스: ${error.stack}`,
          );

          if (feed.deathCount < 3) {
            feed.deathCount++;
            this.redisConnection.rpush(redisConstant.FEED_AI_QUEUE, [
              JSON.stringify(feed),
            ]);
          } else {
            logger.error(
              `${this.nameTag} ${feed.id}의 Death Count 3회 이상 발생 AI 요청 금지: 
            메시지: ${error.message}
            스택 트레이스: ${error.stack}`,
            );
            this.feedRepository.updateNullSummary(feed.id);
          }
        }
      }),
    );
    return feedsWithAIData.filter((value) => value !== undefined);
  }

  private insertTag(feedWithAIList: FeedAIQueueItem[]) {
    return feedWithAIList.map(async (feed) => {
      try {
        await this.tagMapRepository.insertTags(feed.id, feed.tagList);
        await this.redisConnection.hset(
          `feed:recent:${feed.id}`,
          'tag',
          feed.tagList.join(','),
        );
      } catch (error) {
        logger.error(
          `${this.nameTag} ${feed.id}의 태그 저장 중 에러 발생: 
        메시지: ${error.message}
        스택 트레이스: ${error.stack}`,
        );
      }
    });
  }

  private updateSummary(feedWithAIList: FeedAIQueueItem[]) {
    return feedWithAIList.map((feed) =>
      this.feedRepository.updateSummary(feed.id, feed.summary),
    );
  }
}
