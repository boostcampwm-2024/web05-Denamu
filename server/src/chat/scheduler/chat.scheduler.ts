import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import type { BroadcastPayload } from '@chat/constant/chat.constant';
import { ChatService } from '@chat/service/chat.service';

import { WinstonLoggerService } from '@common/logger/logger.service';

const CHAT_MIDNIGHT_CLIENT_NAME = 'system';

@Injectable()
export class ChatScheduler {
  constructor(private readonly chatService: ChatService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  private async midnightInitializer() {
    await this.chatService.setMidnightMessageReady();
  }
}
