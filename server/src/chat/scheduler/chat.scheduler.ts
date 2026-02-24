import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import type { BroadcastPayload } from '@chat/constant/chat.constant';
import { ChatService } from '@chat/service/chat.service';

import { WinstonLoggerService } from '@common/logger/logger.service';

const CHAT_MIDNIGHT_CLIENT_NAME = 'system';

@Injectable()
export class ChatScheduler {
  constructor(
    private readonly chatService: ChatService,
    private readonly logger: WinstonLoggerService,
  ) {}

  async handleDateMessage() {
    const dateString = await this.chatService.getMidnightStatus();
    if (!dateString) return;
    const date = new Date(dateString);

    if (!Number.isNaN(date.getTime())) {
      return await this.saveDateMessage(date);
    }

    this.logger.warn(`Invalid date format이 저장되었습니다: ${dateString}`);
  }

  private async saveDateMessage(date: Date) {
    const broadcastPayload: BroadcastPayload = {
      userId: CHAT_MIDNIGHT_CLIENT_NAME,
      messageId: CHAT_MIDNIGHT_CLIENT_NAME,
      username: CHAT_MIDNIGHT_CLIENT_NAME,
      message: '',
      timestamp: date,
    };

    await this.chatService.saveMessageToRedis(broadcastPayload);

    return broadcastPayload;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  private async midnightInitializer() {
    await this.chatService.saveMidnightStatus();
  }
}
