import { Injectable } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Gauge } from 'prom-client';
import { Server, Socket } from 'socket.io';

import type { BroadcastPayload } from '@chat/constant/chat.constant';
import { ChatScheduler } from '@chat/scheduler/chat.scheduler';
import { ChatService } from '@chat/service/chat.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*', // TODO: 연동 할때 보고 확인 후 설정 해보기
  },
  path: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly chatScheduler: ChatScheduler,
    @InjectMetric('anonymous_chat_user_count')
    private readonly chatUserMetricCount: Gauge,
    @InjectMetric('anonymous_chat_message_count')
    private readonly chatMetricCount: Counter,
  ) {}

  async handleConnection(client: Socket) {
    const userCount = this.server.engine.clientsCount;
    if (this.chatService.isMaxClientExceeded(userCount)) {
      client.emit('maximum_exceeded', {
        message: '채팅 서버의 한계에 도달했습니다. 잠시후 재시도 해주세요.',
      });
      client.disconnect(true);
      return;
    }

    const clientName = await this.chatService.getClientNameByIp(client);
    const chatHistory = await this.chatService.getChatHistory();

    client.emit('chatHistory', chatHistory);

    this.chatUserMetricCount.inc({
      room: 'anonymous',
    });
    this.server.emit('updateUserCount', {
      userCount: userCount,
      name: clientName,
    });
  }

  handleDisconnect() {
    this.chatUserMetricCount.dec({
      room: 'anonymous',
    });
    this.server.emit('updateUserCount', {
      userCount: this.server.engine.clientsCount,
    });
  }

  @SubscribeMessage('message')
  async handleMessage(
    client: Socket,
    payload: { messageId: string; userId: string; message: string },
  ) {
    const clientName = await this.chatService.getClientNameByIp(client);
    const broadcastPayload: BroadcastPayload = {
      userId: payload.userId,
      messageId: payload.messageId,
      username: clientName,
      message: payload.message,
      timestamp: new Date(),
    };

    const midnightMessage = await this.chatScheduler.handleDateMessage();

    if (midnightMessage) {
      this.server.emit('message', midnightMessage);
    }

    this.chatMetricCount.inc({
      room: 'anonymous',
    });

    await this.chatService.saveMessageToRedis(broadcastPayload);
    this.server.emit('message', broadcastPayload);
  }
}
