import { Module } from '@nestjs/common';
import { ChatGateway } from '@chat/chat.gateway';
import { ScheduleModule } from '@nestjs/schedule';
import { ChatService } from '@chat/service/chat.service';
import { ChatScheduler } from '@chat/scheduler/chat.scheduler';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [ChatGateway, ChatService, ChatScheduler],
})
export class ChatModule {}
