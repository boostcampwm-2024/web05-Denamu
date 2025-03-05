import { io, Socket } from "socket.io-client";
import { create } from "zustand";

import { CHAT_SERVER_URL } from "@/constants/endpoints";

import { ChatType } from "@/types/chat";

interface ChatStore {
  chatHistory: ChatType[];
  userCount: number;
  connect: () => void;
  disconnect: () => void;
  getHistory: () => void;
  sendMessage: (message: string) => void;
}

export const useChatStore = create<ChatStore>((set) => {
  let socket: Socket | null = null;

  // 소켓 초기화 함수
  const initializeSocket = () => {
    if (socket) return socket; // 이미 존재하면 그대로 반환

    socket = io(CHAT_SERVER_URL, {
      path: "/chat",
      transports: ["websocket"],
      reconnection: true, // 자동 재연결 활성화
      reconnectionAttempts: 5, // 최대 5번 재시도
      reconnectionDelay: 1000, // 1초 간격으로 재시도
    });

    // 서버 연결 성공 시
    socket.on("connect", () => {});

    // 서버로부터 메시지 받기
    socket.on("message", (data) => {
      set((state) => ({
        chatHistory: [...state.chatHistory, data],
      }));
    });

    // 사용자 수 업데이트 받기
    socket.on("updateUserCount", (data) => {
      set({ userCount: data.userCount });
    });

    // 서버 연결 해제 시
    socket.on("disconnect", () => {});

    return socket;
  };

  return {
    chatHistory: [],
    userCount: 0,

    // Socket 연결 함수
    connect: () => {
      if (socket) return; // 이미 연결된 경우 중복 방지
      initializeSocket();
    },

    // Socket 연결 해제 함수
    disconnect: () => {
      socket?.disconnect();
      socket = null;
    },

    // 이전 채팅 기록 받아오기
    getHistory: () => {
      if (socket) {
        socket.emit("getHistory");
        socket.on("chatHistory", (data) => {
          set(() => ({
            chatHistory: data,
          }));
        });
      } else {
        const newSocket = initializeSocket();
        newSocket.emit("getHistory");
      }
    },

    // 메시지 전송 함수
    sendMessage: (message: string) => {
      if (socket) {
        socket.emit("message", { message });
      } else {
        // 소켓이 없으면 연결 후 메시지 전송
        const newSocket = initializeSocket();
        newSocket.on("connect", () => {
          newSocket.emit("message", { message });
        });
      }
    },
  };
});

interface ChatValue {
  message: string;
  setMessage: (newMessage: string) => void;
}

export const useChatValueStore = create<ChatValue>((set) => ({
  message: "",
  setMessage: (newMessage: string) => set({ message: newMessage }),
}));
