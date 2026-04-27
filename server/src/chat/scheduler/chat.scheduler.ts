import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { ChatService } from '@chat/service/chat.service';

@Injectable()
export class ChatScheduler {
  constructor(private readonly chatService: ChatService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  private async midnightInitializer() {
    await this.chatService.setDateMessageReady();
  }
}
