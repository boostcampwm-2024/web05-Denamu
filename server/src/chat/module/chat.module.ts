import { Module } from '@nestjs/common';

import { ChatGateway } from '@chat/chat.gateway';
import { AnonymousRoomManager } from '@chat/room/anonymous-room.manager';
import { ChatService } from '@chat/service/chat.service';

@Module({
  providers: [ChatGateway, ChatService, AnonymousRoomManager],
})
export class ChatModule {}
