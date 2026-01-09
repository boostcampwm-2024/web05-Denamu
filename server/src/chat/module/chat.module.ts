import { Module } from '@nestjs/common';
import { ChatGateway } from '@src/chat/chat.gateway';
import { ScheduleModule } from '@nestjs/schedule';
import { ChatService } from '@src/chat/service/chat.service';
import { ChatScheduler } from '@src/chat/scheduler/chat.scheduler';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [ChatGateway, ChatService, ChatScheduler],
})
export class ChatModule {}
