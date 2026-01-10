import type { BroadcastPayload } from '@chat/constant/chat.constant';
import { ChatService } from '@chat/service/chat.service';

import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

const CHAT_MIDNIGHT_CLIENT_NAME = 'system';

@Injectable()
export class ChatScheduler {
  private dayInit: boolean = false;

  constructor(private readonly chatService: ChatService) {}

  async handleDateMessage() {
    if (this.dayInit) {
      this.dayInit = false;
      return await this.saveDateMessage();
    }
  }

  private async saveDateMessage() {
    const broadcastPayload: BroadcastPayload = {
      userId: CHAT_MIDNIGHT_CLIENT_NAME,
      messageId: CHAT_MIDNIGHT_CLIENT_NAME,
      username: CHAT_MIDNIGHT_CLIENT_NAME,
      message: '',
      timestamp: new Date(),
    };

    await this.chatService.saveMessageToRedis(broadcastPayload);

    return broadcastPayload;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  private midnightInitializer() {
    this.dayInit = true;
  }
}
