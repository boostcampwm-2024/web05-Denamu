import { Module } from '@nestjs/common';

import { ChatGateway } from '@chat/chat.gateway';
import { ChatService } from '@chat/service/chat.service';

@Module({
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
