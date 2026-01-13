import { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { RedisService } from '@common/redis/redis.service';
import { REDIS_KEYS } from '@common/redis/redis.constant';
import { ChatService } from '@chat/service/chat.service';
import { ChatFixture } from '@test/config/common/fixture/chat.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/chat';

describe('Socket.IO Anonymous Chat E2E Test', () => {
  let clientSocket: Socket;
  let chatService: ChatService;
  let redisService: RedisService;
  let serverUrl: string;

  beforeAll(async () => {
    redisService = testApp.get(RedisService);
    chatService = testApp.get(ChatService);
    const httpServer = await testApp.listen(0);
    const port = httpServer.address().port;
    serverUrl = `http://localhost:${port}`;
  });

  afterEach(() => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  it('[Disconnect] 최대 인원을 초과할 경우 연결을 실패한다.', async () => {
    // given
    jest.spyOn(chatService, 'isMaxClientExceeded').mockReturnValue(true);

    clientSocket = io(serverUrl, {
      forceNew: true,
      reconnection: false,
      path: URL,
    });

    // Socket.IO when
    const data = await new Promise((resolve, reject) => {
      clientSocket.on('maximum_exceeded', (message) => {
        try {
          clientSocket.close();
          resolve(message);
        } catch {
          clientSocket.close();
          reject(new Error(`Socket.IO 채팅 오류: ${JSON.stringify(message)}`));
        }
      });
    });

    // Socket.IO then
    expect(data).toStrictEqual({
      message: '채팅 서버의 한계에 도달했습니다. 잠시후 재시도 해주세요.',
    });
  });

  it('[Connect] 클라이언트가 연결될 경우 이전 채팅 기록을 정상적으로 받는다.', async () => {
    // given
    const mockChatHistory = ChatFixture.createChatHistory(2);

    await redisService.lpush(
      REDIS_KEYS.CHAT_HISTORY_KEY,
      ...mockChatHistory.map((chat) => JSON.stringify(chat)).reverse(),
    );

    clientSocket = io(serverUrl, {
      forceNew: true,
      reconnection: false,
      path: URL,
    });

    // Socket.IO when
    const data = await new Promise((resolve, reject) => {
      clientSocket.on('chatHistory', (chatHistory) => {
        try {
          clientSocket.close();
          resolve(chatHistory);
        } catch {
          clientSocket.close();
          reject(
            new Error(`Socket.IO 채팅 오류: ${JSON.stringify(chatHistory)}`),
          );
        }
      });
    });

    // Socket.IO then
    expect(data).toStrictEqual(mockChatHistory.reverse());
  });

  it('[Connect] 클라이언트가 연결될 경우 닉네임과 현재 접속중인 유저 수 정보를 받는다.', async () => {
    // given
    clientSocket = io(serverUrl, {
      forceNew: true,
      reconnection: false,
      path: URL,
    });

    // Socket.IO when
    const data = await new Promise((resolve, reject) => {
      clientSocket.on('updateUserCount', (data) => {
        try {
          clientSocket.close();
          resolve(data);
        } catch {
          clientSocket.close();
          reject(new Error(`Socket.IO 채팅 오류: ${JSON.stringify(data)}`));
        }
      });
    });

    // Socket.IO then
    expect(data).toStrictEqual({
      userCount: 1,
      name: expect.any(String),
    });
  });

  it('[Connect] 클라이언트가 메시지를 보낼 경우 다른 클라이언트에 메시지가 브로드캐스트된다.', async () => {
    // given
    const chat = ChatFixture.createChat();

    clientSocket = io(serverUrl, {
      forceNew: true,
      reconnection: false,
      path: URL,
    });
    clientSocket.emit('message', chat);

    // Socket.IO when
    const data = await new Promise((resolve, reject) => {
      clientSocket.on('message', (message) => {
        try {
          clientSocket.close();
          resolve(message);
        } catch {
          clientSocket.close();
          reject(new Error(`Socket.IO 채팅 오류: ${JSON.stringify(message)}`));
        }
      });
    });

    // Socket.IO then
    expect(data).toStrictEqual({
      userId: chat.userId,
      messageId: chat.messageId,
      message: chat.message,
      username: expect.any(String),
      timestamp: expect.any(String),
    });
  });
});
