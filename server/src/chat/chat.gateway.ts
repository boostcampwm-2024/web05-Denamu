import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { ChatService } from './service/chat.service';
import { ChatScheduler } from './scheduler/chat.scheduler';
import type { BroadcastPayload } from './chat.type';

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

    this.server.emit('updateUserCount', {
      userCount: userCount,
      name: clientName,
    });
  }

  handleDisconnect() {
    this.server.emit('updateUserCount', {
      userCount: this.server.engine.clientsCount,
    });
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: { message: string }) {
    const clientName = await this.chatService.getClientNameByIp(client);

    const broadcastPayload: BroadcastPayload = {
      username: clientName,
      message: payload.message,
      timestamp: new Date(),
    };

    const midnightMessage = await this.chatScheduler.handleDateMessage();

    if (midnightMessage) {
      this.server.emit('message', midnightMessage);
    }

    await this.chatService.saveMessageToRedis(broadcastPayload);
    this.server.emit('message', broadcastPayload);
  }
}
