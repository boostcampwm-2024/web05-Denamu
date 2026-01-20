import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { ChatGateway } from '@chat/chat.gateway';
import { ChatScheduler } from '@chat/scheduler/chat.scheduler';
import { ChatService } from '@chat/service/chat.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [ChatGateway, ChatService, ChatScheduler],
})
export class ChatModule {}
