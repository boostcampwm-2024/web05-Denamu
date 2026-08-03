import { beforeEach, describe, expect, it, vi } from "vitest";

type Handler = (...args: unknown[]) => void;

const { mockSocket, ioMock, resetMockSocket } = vi.hoisted(() => {
  let listeners: Record<string, Handler[]> = {};

  const mockSocket = {
    connected: false,
    on: vi.fn((event: string, cb: Handler) => {
      (listeners[event] ??= []).push(cb);
    }),
    off: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(() => {
      mockSocket.connected = true;
    }),
    disconnect: vi.fn(() => {
      mockSocket.connected = false;
    }),
    trigger: (event: string, data?: unknown) => {
      (listeners[event] ?? []).forEach((cb) => cb(data));
    },
    listenerCount: (event: string) => (listeners[event] ?? []).length,
  };

  const ioMock = vi.fn(() => mockSocket);

  const resetMockSocket = () => {
    listeners = {};
    mockSocket.connected = false;
    mockSocket.on.mockClear();
    mockSocket.off.mockClear();
    mockSocket.emit.mockClear();
    mockSocket.connect.mockClear();
    mockSocket.disconnect.mockClear();
  };

  return { mockSocket, ioMock, resetMockSocket };
});

vi.mock("socket.io-client", () => ({ io: ioMock }));

describe("useChatStore", () => {
  let useChatStore: typeof import("@/store/useChatStore").useChatStore;

  beforeEach(async () => {
    resetMockSocket();
    localStorage.clear();
    vi.resetModules();
    ({ useChatStore } = await import("@/store/useChatStore"));
  });

  it("소켓 재연결로 chatHistory가 다시 수신돼도 메시지가 누적되지 않는다", () => {
    useChatStore.getState().getHistory();

    const historyPayload = [
      { messageId: "1", userName: "a", message: "hi", timestamp: "t1" },
      { messageId: "2", userName: "b", message: "hello", timestamp: "t2" },
    ];

    mockSocket.trigger("chatHistory", historyPayload);
    mockSocket.trigger("chatHistory", historyPayload);
    mockSocket.trigger("chatHistory", historyPayload);

    expect(useChatStore.getState().chatHistory).toHaveLength(2);
  });

  it("chatHistory로 받은 과거 메시지는 isSend:true로 스탬프된다", () => {
    useChatStore.getState().getHistory();

    mockSocket.trigger("chatHistory", [{ messageId: "1", userName: "a", message: "hi", timestamp: "t1" }]);

    expect(useChatStore.getState().chatHistory[0].isSend).toBe(true);
  });

  it("전송 대기/실패 중인 로컬 메시지는 chatHistory 갱신 후에도 유지된다", () => {
    useChatStore.getState().getHistory();
    useChatStore.setState({
      chatHistory: [
        { messageId: "pending-1", userName: "me", message: "재전송 대기", timestamp: "t", isFailed: true, isSend: false },
      ],
    });

    mockSocket.trigger("chatHistory", [{ messageId: "1", userName: "a", message: "hi", timestamp: "t1" }]);

    const { chatHistory } = useChatStore.getState();
    expect(chatHistory).toHaveLength(2);
    expect(chatHistory.some((c) => c.messageId === "pending-1")).toBe(true);
  });

  it("connect/getHistory를 여러 번 호출해도 소켓 리스너가 중복 등록되지 않는다", () => {
    const { connect, getHistory } = useChatStore.getState();

    connect("anonymous");
    connect("anonymous");
    getHistory();
    getHistory();

    expect(mockSocket.listenerCount("chatHistory")).toBe(1);
    expect(mockSocket.listenerCount("connect")).toBe(1);
  });
});
