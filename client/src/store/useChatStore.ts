import { io, Socket } from "socket.io-client";
import { create } from "zustand";

import { ChatType } from "@/types/chat";

const CHAT_SERVER_URL = "https://denamu.site";

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

  return {
    chatHistory: [],
    userCount: 0,

    // Socket 연결 함수
    connect: () => {
      if (socket) return; // 이미 연결된 경우 중복 방지

      socket = io(CHAT_SERVER_URL, { path: "/chat", transports: ["websocket"] });

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
    },

    // Socket 연결 해제 함수
    disconnect: () => {
      socket?.disconnect();
      socket = null;
    },

    // 이전 채팅 기록 받아오기
    getHistory: () => {
      if (socket) {
        socket.on("chatHistory", (data) => {
          set(() => ({
            chatHistory: data,
          }));
        });
      } else {
      }
    },
    // 메시지 전송 함수
    sendMessage: (message: string) => {
      if (socket) {
        socket.emit("message", { message });
      } else {
      }
    },
  };
});
interface ChatValue {
  message: string;
  setMessage: (newMessage: string) => void;
}
export const useChatValueStroe = create<ChatValue>((set) => ({
  message: "",
  setMessage: (newMessage: string) => set({ message: newMessage }),
}));
