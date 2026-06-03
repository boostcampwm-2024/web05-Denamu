import { Server } from 'http';
import { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

import { CHAT_HISTORY_LIMIT } from '@chat/constant/constant';
import { AnonymousRoomManager } from '@chat/room/anonymous-room.manager';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { ChatFixture } from '@test/config/common/fixture/chat.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

describe('Socket.IO Anonymous Chat E2E Test', () => {
  let clientSocket: Socket;
  let redisService: RedisService;
  let anonymousRoomManager: AnonymousRoomManager;
  let serverUrl: string;

  beforeAll(async () => {
    redisService = testApp.get(RedisService);
    anonymousRoomManager = testApp.get(AnonymousRoomManager);
    await testApp.listen(0);
    const httpServer = testApp.getHttpServer() as Server;

    const address = httpServer.address();

    if (!address || typeof address === 'string') {
      throw new Error('Invalid address');
    }

    const port = address.port;

    serverUrl = `http://localhost:${port}`;
  });

  afterEach(() => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
    jest.restoreAllMocks();
  });

  it('[Disconnect] 최대 인원을 초과할 경우 연결을 실패한다.', async () => {
    // given
    jest.spyOn(anonymousRoomManager, 'assignRoom').mockReturnValue(null);

    clientSocket = io(serverUrl, {
      forceNew: true,
      reconnection: false,
      query: { room: 'anonymous' },
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
      REDIS_KEYS.CHAT_HISTORY_KEY('anonymous1'),
      ...mockChatHistory.map((chat) => JSON.stringify(chat)).reverse(),
    );

    clientSocket = io(serverUrl, {
      forceNew: true,
      reconnection: false,
      query: { room: 'anonymous' },
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

  it('[Connect] 클라이언트가 연결될 경우 현재 접속중인 유저 수 정보를 받는다.', async () => {
    // given
    clientSocket = io(serverUrl, {
      forceNew: true,
      reconnection: false,
      query: { room: 'anonymous' },
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
    });
  });

  it('[Register] 신규 클라이언트가 register 이벤트를 발행하면 assignUserId 이벤트로 UUID를 발급받는다.', async () => {
    // given
    clientSocket = io(serverUrl, {
      forceNew: true,
      reconnection: false,
      query: { room: 'anonymous' },
    });

    // Socket.IO when
    const data = await new Promise((resolve, reject) => {
      clientSocket.on('connect', () => {
        clientSocket.emit('register', { userId: null });
      });

      clientSocket.on('assignUserId', (payload) => {
        try {
          clientSocket.close();
          resolve(payload);
        } catch {
          clientSocket.close();
          reject(new Error(`Socket.IO 채팅 오류: ${JSON.stringify(payload)}`));
        }
      });
    });

    // Socket.IO then
    expect(data).toStrictEqual({
      userId: expect.any(String),
    });
  });

  it('[Register] 기존 UUID로 register 이벤트를 발행하면 assignUserId 이벤트가 발생하지 않는다.', async () => {
    // given
    const existingChat = ChatFixture.createChat();
    await redisService.set(
      `socket_client:${existingChat.userId}`,
      'existingNickname',
      'EX',
      3600 * 24,
    );

    clientSocket = io(serverUrl, {
      forceNew: true,
      reconnection: false,
      query: { room: 'anonymous' },
    });

    // Socket.IO when
    const data = await new Promise<'no_assign'>((resolve) => {
      clientSocket.on('connect', () => {
        clientSocket.emit('register', { userId: existingChat.userId });
      });

      clientSocket.on('assignUserId', () => {
        clientSocket.close();
        resolve('no_assign');
      });

      setTimeout(() => {
        clientSocket.close();
        resolve('no_assign' as const);
      }, 500);
    });

    // Socket.IO then
    expect(data).toBe('no_assign');
  });

  it('[Message] 클라이언트가 메시지를 보낼 경우 다른 클라이언트에 메시지가 브로드캐스트된다.', async () => {
    // given
    const chat = ChatFixture.createChat();

    clientSocket = io(serverUrl, {
      forceNew: true,
      reconnection: false,
      query: { room: 'anonymous' },
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
      userName: expect.any(String),
      timestamp: expect.any(String),
      room: expect.any(String),
    });
  });

  it('[Connect] 연결 시 assignRoom 이벤트로 roomId와 roomName을 수신한다.', async () => {
    // given
    clientSocket = io(serverUrl, {
      forceNew: true,
      reconnection: false,
      query: { room: 'anonymous1' },
    });

    // Socket.IO when
    const data = await new Promise((resolve, reject) => {
      clientSocket.on('assignRoom', (payload) => {
        try {
          clientSocket.close();
          resolve(payload);
        } catch {
          clientSocket.close();
          reject(new Error(`Socket.IO 채팅 오류: ${JSON.stringify(payload)}`));
        }
      });
    });

    // Socket.IO then
    expect(data).toStrictEqual({
      roomId: 'anonymous1',
      roomName: '익명 채팅방 1',
    });
  });

  it('[Connect] 채팅 기록이 없을 경우 빈 배열을 수신한다.', async () => {
    // given (Redis는 afterEach에서 초기화)
    clientSocket = io(serverUrl, {
      forceNew: true,
      reconnection: false,
      query: { room: 'anonymous' },
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
    expect(data).toStrictEqual([]);
  });

  it('[Disconnect] 연결 해제 시 해당 방의 유저 수가 감소한다.', async () => {
    // given
    clientSocket = io(serverUrl, {
      forceNew: true,
      reconnection: false,
      query: { room: 'anonymous1' },
    });

    await new Promise<void>((resolve) => {
      clientSocket.once('updateUserCount', () => resolve());
    });

    const clientSocket2 = io(serverUrl, {
      forceNew: true,
      reconnection: false,
      query: { room: 'anonymous1' },
    });

    await new Promise<void>((resolve) => {
      clientSocket.once('updateUserCount', () => resolve());
    });

    // Socket.IO when
    const data = await new Promise((resolve, reject) => {
      clientSocket.once('updateUserCount', (payload) => {
        try {
          resolve(payload);
        } catch {
          reject(new Error(`Socket.IO 채팅 오류: ${JSON.stringify(payload)}`));
        }
      });
      clientSocket2.disconnect();
    });

    // Socket.IO then
    expect(data).toStrictEqual({ userCount: 1 });
  });

  it('[Message] 메시지 전송 시 Redis에 저장된다.', async () => {
    // given
    const chat = ChatFixture.createChat();

    clientSocket = io(serverUrl, {
      forceNew: true,
      reconnection: false,
      query: { room: 'anonymous1' },
    });

    // Socket.IO when
    await new Promise<void>((resolve) => {
      clientSocket.on('message', () => resolve());
      clientSocket.on('connect', () => {
        clientSocket.emit('message', chat);
      });
    });

    // Socket.IO then
    const history = await redisService.lrange(
      REDIS_KEYS.CHAT_HISTORY_KEY('anonymous1'),
      0,
      -1,
    );
    expect(history).toHaveLength(1);
    const saved = JSON.parse(history[0]) as { message: string; userId: string };
    expect(saved.message).toBe(chat.message);
    expect(saved.userId).toBe(chat.userId);
  });

  it('[Message] CHAT_HISTORY_LIMIT 초과 메시지 저장 시 오래된 메시지가 제거된다.', async () => {
    // given: Redis에 CHAT_HISTORY_LIMIT개의 메시지 미리 적재
    const existingMessages = ChatFixture.createChatHistory(CHAT_HISTORY_LIMIT);
    await redisService.lpush(
      REDIS_KEYS.CHAT_HISTORY_KEY('anonymous1'),
      ...existingMessages.map((m) => JSON.stringify(m)).reverse(),
    );

    const chat = ChatFixture.createChat();
    clientSocket = io(serverUrl, {
      forceNew: true,
      reconnection: false,
      query: { room: 'anonymous1' },
    });

    // Socket.IO when: 메시지 1개 추가 전송
    await new Promise<void>((resolve) => {
      clientSocket.on('message', () => resolve());
      clientSocket.on('connect', () => {
        clientSocket.emit('message', chat);
      });
    });

    // Socket.IO then
    const history = await redisService.lrange(
      REDIS_KEYS.CHAT_HISTORY_KEY('anonymous1'),
      0,
      -1,
    );
    expect(history).toHaveLength(CHAT_HISTORY_LIMIT);
  });
});
