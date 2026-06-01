import { Module } from '@nestjs/common';

import { ChatGateway } from '@chat/chat.gateway';
import { ChatScheduler } from '@chat/scheduler/chat.scheduler';
import { ChatService } from '@chat/service/chat.service';

@Module({
  providers: [ChatGateway, ChatService, ChatScheduler],
})
export class ChatModule {}
