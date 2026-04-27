import { injectable } from 'tsyringe';

import axios from 'axios';
import { EventEmitter } from 'node:events';

import logger from '@src/logger';
import {
  EmailDlqPayload,
  NOTIFICATION_EVENT,
  NotificationEventPayloadMap,
} from '@src/notification/notification-event.constant';
import { Notifier } from '@src/notification/notifier.interface';

@injectable()
export class DiscordNotifier implements Notifier {
  private webhookUrl: string;
  private webhook: string;
  private eventEmitter: EventEmitter;
  private initialized = false;

  constructor() {
    this.webhookUrl = process.env.EMAIL_WORKER_DISCORD_WEBHOOK_URL;
    this.webhook = `DISCORD`;
    if (!this.webhookUrl) {
      throw new Error(`${this.webhook} Webhook url이 설정되지 않았습니다.`);
    }
    this.eventEmitter = new EventEmitter();
  }

  initialize() {
    if (!this.initialized) {
      this.eventEmitter.on(
        NOTIFICATION_EVENT.EMAIL_DLQ,
        this.sendEmailDlqAlert,
      );
      this.initialized = true;
    }
  }

  private sendEmailDlqAlert = async (payload: EmailDlqPayload) => {
    const { error, dlqMessage } = payload;
    const discordStartTime = Date.now();
    try {
      await axios.post(this.webhookUrl, {
        content: `${dlqMessage} DLQ 메시지 발행 - 오류 메시지: \`\`\`${error.message}\`\`\``,
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
