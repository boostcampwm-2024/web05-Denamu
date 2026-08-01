import { Module } from '@nestjs/common';

import { ChatGateway } from '@chat/chat.gateway';
import { AdminChatController } from '@chat/controller/adminChat.controller';
import { AnonymousRoomManager } from '@chat/room/anonymous-room.manager';
import { ChatService } from '@chat/service/chat.service';

@Module({
  controllers: [AdminChatController],
  providers: [ChatGateway, ChatService, AnonymousRoomManager],
})
export class ChatModule {}
