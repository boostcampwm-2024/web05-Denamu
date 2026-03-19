import { injectable } from 'tsyringe';

import axios from 'axios';
import { EventEmitter } from 'node:events';

import logger from '@common/logger';
import {
  aiSummaryPayload,
  fullFeedCrawlingPayload,
  NOTIFICATION_EVENT,
  NotificationEventPayloadMap,
  scheduledFeedCrawlingPayload,
} from '@common/notification/notification-event.constant';
import { Notifier } from '@common/notification/notifier.interface';

@injectable()
export class DiscordNotifier implements Notifier {
  private webhookUrl: string;
  private webhook: string;
  private eventEmitter: EventEmitter;
  private initialized = false;

  constructor() {
    this.webhookUrl = process.env.FEED_CRAWLER_DISCORD_WEBHOOK_URL;
    this.webhook = `DISCORD`;
    if (!this.webhookUrl) {
      throw new Error(`${this.webhook} Webhook url이 설정되지 않았습니다.`);
    }
    this.eventEmitter = new EventEmitter();
  }

  initialize() {
    if (!this.initialized) {
      this.eventEmitter.on(
        NOTIFICATION_EVENT.FEED_CRAWLING_SCHEDULED,
        this.sendScheduledFeedCrawlingAlert,
      );
      this.eventEmitter.on(
        NOTIFICATION_EVENT.FEED_CRAWLING_FULL,
        this.sendFullFeedCrawlingAlert,
      );
      this.eventEmitter.on(
        NOTIFICATION_EVENT.AI_SUMMARY,
        this.sendAiSummaryAlert,
      );
      this.initialized = true;
    }
  }

  private sendScheduledFeedCrawlingAlert = async (
    payload: scheduledFeedCrawlingPayload,
  ) => {
    const { error, blogUrl, errorSource } = payload;
    const discordStartTime = Date.now();
    try {
      await axios.post(this.webhookUrl, {
        content: `${errorSource} ${blogUrl}의 scheduled feed crawling 에러 발생 - 오류 메시지: \`\`\`${error.message}\`\`\``,
      });
    } catch (e) {
      logger.error('Discord 알림 전송 실패:', e);
    }
    logger.info(`알림 소요 시간: ${Date.now() - discordStartTime}`);
  };

  private sendFullFeedCrawlingAlert = async (
    payload: fullFeedCrawlingPayload,
  ) => {
    const { error, blogUrl, errorSource } = payload;
    const discordStartTime = Date.now();
    try {
      await axios.post(this.webhookUrl, {
        content: `${errorSource} ${blogUrl} full feed crawling 에러 발생 - 오류 메시지: \`\`\`${error.message}\`\`\``,
      });
    } catch (e) {
      logger.error('Discord 알림 전송 실패:', e);
    }
    logger.info(`알림 소요 시간: ${Date.now() - discordStartTime}`);
  };

  private sendAiSummaryAlert = async (payload: aiSummaryPayload) => {
    const { error, feedId, errorSource } = payload;
    const discordStartTime = Date.now();
    try {
      await axios.post(this.webhookUrl, {
        content: `${errorSource} ${feedId}번 Feed AI 요약 중 에러 발생 - 오류 메시지: \`\`\`${error.message}\`\`\``,
      });
    } catch (e) {
      logger.error('Discord 알림 전송 실패:', e);
    }
    logger.info(`알림 소요 시간: ${Date.now() - discordStartTime}`);
  };

  publish<K extends keyof NotificationEventPayloadMap>(
    eventName: K,
    payload: NotificationEventPayloadMap[K],
  ) {
    this.eventEmitter.emit(eventName, payload);
  }
}
