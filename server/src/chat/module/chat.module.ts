import { Module } from '@nestjs/common';
import { ChatGateway } from '../chat.gateway';
import { ScheduleModule } from '@nestjs/schedule';
import { ChatService } from '../service/chat.service';
import { ChatScheduler } from '../scheduler/chat.scheduler';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [ChatGateway, ChatService, ChatScheduler],
})
export class ChatModule {}
