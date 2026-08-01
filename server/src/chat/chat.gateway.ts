import { Injectable, UseFilters, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import type {
  BroadcastPayload,
  RedisMessagePayload,
} from '@chat/constant/type';
import { ChatWsExceptionFilter } from '@chat/filter/ws.exception.filter';
import { AnonymousRoomManager } from '@chat/room/anonymous-room.manager';
import { ChatService } from '@chat/service/chat.service';

import { WinstonLoggerService } from '@common/logger/logger.service';
import { getWsIp } from '@common/util/getWsIp';

import { SendMessageDto } from './dto/sendMessage.dto';

@UseFilters(new ChatWsExceptionFilter())
@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*', // TODO: 연동 할때 보고 확인 후 설정 해보기
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly anonymousRoomManager: AnonymousRoomManager,
    private readonly logger: WinstonLoggerService,
  ) {}

  private getClientRoomId(client: Socket): string | undefined {
    return (client.data as { roomId?: string }).roomId;
  }

  private getClientIp(client: Socket): string | undefined {
    return (client.data as { ip?: string }).ip;
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    (client.data as { ip?: string }).ip = getWsIp(client);

    const requestedRoom = client.handshake.query.room as string | undefined;
    let roomId: string;
    let roomName: string;

    if (!requestedRoom || requestedRoom.startsWith('anonymous')) {
      const assignment = this.anonymousRoomManager.assignRoom(
        this.server,
        requestedRoom,
      );
      if (!assignment) {
        client.emit('maximum_exceeded', {
          message: '채팅 서버의 한계에 도달했습니다. 잠시후 재시도 해주세요.',
        });
        client.disconnect(true);
        return;
      }
      roomId = assignment.roomId;
      roomName = assignment.roomName;
    } else {
      roomId = requestedRoom;
      roomName = requestedRoom;
    }

    (client.data as { roomId?: string }).roomId = roomId;
    await client.join(roomId);

    client.emit('assignRoom', { roomId, roomName });

    const chatHistory = await this.chatService.getChatHistory(roomId);
    client.emit('chatHistory', chatHistory);

    const roomSize = this.server.sockets.adapter.rooms.get(roomId)?.size ?? 0;
    this.server.to(roomId).emit('updateUserCount', { userCount: roomSize });

    this.anonymousRoomManager.trackUserConnected(roomId);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    const roomId = this.getClientRoomId(client);
    if (!roomId) return;

    const roomSize = this.server.sockets.adapter.rooms.get(roomId)?.size ?? 0;
    this.server.to(roomId).emit('updateUserCount', { userCount: roomSize });

    this.anonymousRoomManager.trackUserDisconnected(roomId);
  }

  @SubscribeMessage('register')
  async handleRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { userId: string | null },
  ) {
    const requestedRoom = client.handshake.query.room as string | undefined;
    if (
      requestedRoom &&
      !this.anonymousRoomManager.isAnonymousRoom(requestedRoom)
    )
      return;

    const result = await this.anonymousRoomManager.getOrCreateUserName(
      payload?.userId ?? null,
    );
    if (result.isNew) {
      client.emit('assignUserId', { userId: result.userId });
    }
    client.emit('assignUserName', { userName: result.userName });
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(new ValidationPipe({ transform: true }))
    payload: SendMessageDto,
  ) {
    const roomId = this.getClientRoomId(client);
    if (!roomId) return;

    const { userName } = await this.anonymousRoomManager.getOrCreateUserName(
      payload.userId,
    );

    const redisPayload: RedisMessagePayload = {
      messageId: payload.messageId,
      userId: payload.userId,
      userName,
      message: payload.message,
      timestamp: new Date().toISOString(),
      room: roomId,
    };

    this.anonymousRoomManager.trackMessageSent(roomId);

    this.logger.log(
      JSON.stringify({
        ip: this.getClientIp(client),
        room: roomId,
        userId: payload.userId,
        userName,
        messageId: payload.messageId,
        message: payload.message,
      }),
    );

    await this.chatService.saveMessageToRedis(redisPayload);
    this.server.to(roomId).emit('message', redisPayload);
  }

  getRoomClientCount(roomId: string): number {
    return this.anonymousRoomManager.getRoomClientCount(this.server, roomId);
  }

  broadcastDeletedMessage(roomId: string, payload: BroadcastPayload) {
    this.server.to(roomId).emit('messageDeleted', payload);
  }
}
