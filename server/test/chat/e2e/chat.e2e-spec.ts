import { INestApplication } from '@nestjs/common';
import { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { RedisService } from '../../../src/common/redis/redis.service';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import { ChatService } from '../../../src/chat/service/chat.service';

const URL = '/chat';

describe('Socket.IO Anonymous Chat E2E Test', () => {
  let app: INestApplication;
  let clientSocket: Socket;
  let chatService: ChatService;
  let redisService: RedisService;
  let serverUrl: string;

  beforeAll(async () => {
    app = global.testApp;
    redisService = app.get(RedisService);
    chatService = app.get(ChatService);

    const httpServer = await app.listen(0);
    const port = httpServer.address().port;
    serverUrl = `http://localhost:${port}`;
  });

  afterEach(async () => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
    await redisService.del(REDIS_KEYS.CHAT_HISTORY_KEY);
  });

  it('[Connect] 클라이언트가 메시지를 보낼 경우 다른 클라이언트에 메시지가 브로드캐스트된다.', async () => {
    // given
    const messagePayload = {
      messageId: '123',
      userId: 'random-uuid',
      message: 'Hello, World!',
    };

    clientSocket = io(serverUrl, {
      forceNew: true,
      reconnection: false,
      path: URL,
    });
    clientSocket.emit('message', messagePayload);

    // when
    const data = await new Promise((resolve, reject) => {
      clientSocket.on('message', (message) => {
        try {
          clientSocket.close();
          resolve(message);
        } catch (error) {
          clientSocket.close();
          reject(error);
        }
      });
    });

    // then
    expect(data).toMatchObject({
      message: 'Hello, World!',
      username: expect.any(String),
      timestamp: expect.any(String),
    });
  });

  it('[Disconnect] 최대 인원을 초과할 경우 연결을 실패한다.', async () => {
    // given
    jest.spyOn(chatService, 'isMaxClientExceeded').mockReturnValue(true);

    clientSocket = io(serverUrl, {
      forceNew: true,
      reconnection: false,
      path: URL,
    });

    // when
    const data = await new Promise((resolve, reject) => {
      clientSocket.on('maximum_exceeded', (message) => {
        try {
          clientSocket.close();
          resolve(message);
        } catch (error) {
          clientSocket.close();
          reject(error);
        }
      });
    });

    // then
    expect(data).toEqual({
      message: '채팅 서버의 한계에 도달했습니다. 잠시후 재시도 해주세요.',
    });
  });

  it('[Connect] 클라이언트가 연결될 경우 닉네임과 현재 접속중인 유저 수 정보를 받는다.', async () => {
    // given
    clientSocket = io(serverUrl, {
      forceNew: true,
      reconnection: false,
      path: URL,
    });

    // when
    const data: any = await new Promise((resolve, reject) => {
      clientSocket.on('updateUserCount', (data) => {
        try {
          clientSocket.close();
          resolve(data);
        } catch (error) {
          clientSocket.close();
          reject(error);
        }
      });
    });

    // then
    expect(data).toStrictEqual({
      userCount: expect.any(Number),
      name: expect.any(String),
    });
  });

  it('[Connect] 클라이언트가 연결될 경우 이전 채팅 기록을 정상적으로 받는다.', async () => {
    // given
    const mockChatHistory = [
      {
        username: 'test name',
        message: 'Hello',
        timestamp: new Date().toISOString(),
      },
      {
        username: 'test name2',
        message: 'Hi',
        timestamp: new Date().toISOString(),
      },
    ];

    await redisService.lpush(
      REDIS_KEYS.CHAT_HISTORY_KEY,
      JSON.stringify(mockChatHistory[1]),
      JSON.stringify(mockChatHistory[0]),
    );

    clientSocket = io(serverUrl, {
      forceNew: true,
      reconnection: false,
      path: URL,
    });

    // when
    const data = await new Promise((resolve, reject) => {
      clientSocket.on('chatHistory', (chatHistory) => {
        try {
          clientSocket.close();
          resolve(chatHistory);
        } catch (error) {
          clientSocket.close();
          reject(error);
        }
      });
    });

    // then
    expect(data).toStrictEqual(mockChatHistory.reverse());
  });
});
