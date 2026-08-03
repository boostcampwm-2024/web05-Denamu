import { io, Socket } from "socket.io-client";
import { create } from "zustand";

import { CHAT_SERVER_URL } from "@/constants/endpoints";

import { ChatType, SendChatType } from "@/types/chat";

let socket: Socket | null = null;
const pendingTimeouts: Record<string, NodeJS.Timeout> = {};

type State = {
  chatHistory: ChatType[];
  userCount: number;
  isLoading: boolean;
  isConnected: boolean;
  currentRoomId: string;
  currentRoomName: string;
  currentUserName: string;
};
type Action = {
  connect: (room?: string) => void;
  disconnect: () => void;
  getHistory: () => void;
  sendMessage: (message: SendChatType) => void;
  resendMessage: (data: ChatType) => void;
  deleteMessage: (messageId: string) => void;
  chatLength: () => number;
  switchRoom: (roomId: string) => void;
};

export const useChatStore = create<State & Action>((set, get) => {
  const initializeSocket = (room: string = 'anonymous') => {
    if (socket) return socket;
    socket = io(CHAT_SERVER_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: false,
      query: { room },
    });

    socket.on("message", (data) => {
      if (pendingTimeouts[data.messageId]) {
        clearTimeout(pendingTimeouts[data.messageId]);
        delete pendingTimeouts[data.messageId];
      }

      set((state) => {
        const index = state.chatHistory.findIndex((msg) => msg.messageId === data.messageId);
        if (index !== -1) {
          const newHistory = [...state.chatHistory];
          newHistory[index] = { ...data, isSend: true, isFailed: false };
          return { chatHistory: newHistory };
        }
        return { chatHistory: [...state.chatHistory, { ...data, isSend: true, isFailed: false }] };
      });
    });

    socket.on("chatHistory", (data: ChatType[]) => {
      set((state) => {
        const failedMessages = state.chatHistory.filter((chat) => chat.isFailed || !chat.isSend);
        return {
          chatHistory: [...data.map((chat) => ({ ...chat, isSend: true })), ...failedMessages],
          isLoading: false,
        };
      });
    });

    socket.on("messageDeleted", (data) => {
      set((state) => ({
        chatHistory: state.chatHistory.map((msg) =>
          msg.messageId === data.messageId
            ? { ...msg, message: data.message, userName: data.userName }
            : msg
        ),
      }));
    });

    socket.on('assignUserId', ({ userId }: { userId: string }) => {
      localStorage.setItem('userID', userId);
    });

    socket.on('assignRoom', ({ roomId, roomName }: { roomId: string; roomName: string }) => {
      set({ currentRoomId: roomId, currentRoomName: roomName });
    });

    socket.on('assignUserName', ({ userName }: { userName: string }) => {
      localStorage.setItem('userName', userName);
      set({ currentUserName: userName });
    });

    socket.on("updateUserCount", (data) => {
      set({ userCount: data.userCount });
    });

    socket.on("connect", () => {
      useChatStore.setState({ isConnected: true });
      socket?.emit("register", { userId: localStorage.getItem("userID") });
    });

    socket.on("disconnect", () => {
      useChatStore.setState({ isConnected: false });
    });

    return socket;
  };

  return {
    chatHistory: [],
    userCount: 0,
    isLoading: true,
    isConnected: false,
    currentRoomId: '',
    currentRoomName: '',
    currentUserName: localStorage.getItem('userName') ?? '',

    connect: (room?: string) => {
      const s = initializeSocket(room ?? 'anonymous');
      if (!s.connected) {
        s.connect();
      }
    },

    disconnect: () => {
      socket?.disconnect();
    },

    switchRoom: (roomId: string) => {
      socket?.disconnect();
      socket = null;
      set({ chatHistory: [], currentRoomId: '', currentRoomName: '', isLoading: true, isConnected: false });

      const s = initializeSocket(roomId);
      s.connect();
    },

    getHistory: () => {
      initializeSocket();
    },

    sendMessage: (message: SendChatType) => {
      const s = initializeSocket();

      useChatStore.setState((state) => ({
        chatHistory: [
          ...state.chatHistory,
          {
            timestamp: '전송중',
            userName: state.currentUserName,
            message: message.message,
            messageId: message.messageId,
            userId: localStorage.getItem("userID"),
          } as ChatType,
        ],
      }));

      pendingTimeouts[message.messageId] = setTimeout(() => {
        useChatStore.setState((state) => ({
          chatHistory: state.chatHistory.map((m) => (m.messageId === message.messageId ? { ...m, isFailed: true } : m)),
        }));
        delete pendingTimeouts[message.messageId];
      }, 5000);

      if (s.connected) {
        s.emit("message", message);
      } else {
        s.connect();
      }
    },

    resendMessage: (data: ChatType) => {
      const s = initializeSocket();
      if (s.connected) {
        s.emit("message", {
          message: data.message,
          messageId: data.messageId,
          userId: data.userId,
        });
        useChatStore.setState((state) => ({
          chatHistory: state.chatHistory.map((m) =>
            m.messageId === data.messageId ? { ...m, isFailed: false, timestamp: "전송중", isSend: false } : m
          ),
        }));

        pendingTimeouts[data.messageId as string] = setTimeout(() => {
          useChatStore.setState((state) => ({
            chatHistory: state.chatHistory.map((m) => (m.messageId === data.messageId ? { ...m, isFailed: true } : m)),
          }));
          delete pendingTimeouts[data.messageId as string];
        }, 5000);
      } else {
        console.error("소켓이 끊겼습니다. 재전송할 수 없습니다.");
        alert("지금은 연결이 끊겨 재전송할 수 없습니다.");
      }
    },

    deleteMessage: (messageId: string) => {
      if (pendingTimeouts[messageId]) {
        clearTimeout(pendingTimeouts[messageId]);
        delete pendingTimeouts[messageId];
      }
      useChatStore.setState((state) => ({
        chatHistory: state.chatHistory.filter((m) => m.messageId !== messageId),
      }));
      alert("메시지가 삭제되었습니다");
    },

    chatLength: () => get().chatHistory.length,
  };
});
