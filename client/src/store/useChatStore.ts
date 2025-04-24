import { io, Socket } from "socket.io-client";
import { create } from "zustand";

import { CHAT_SERVER_URL } from "@/constants/endpoints";

import { ChatType } from "@/types/chat";

type State = {
  chatHistory: ChatType[];
  userCount: number;
  isLoading: boolean;
};
type Action = {
  connect: () => void;
  disconnect: () => void;
  getHistory: () => void;
  sendMessage: (message: string) => void;
};

export const useChatStore = create<State & Action>((set) => {
  let socket: Socket | null = null;
  const initializeSocket = () => {
    if (socket) return socket;

    socket = io(CHAT_SERVER_URL, {
      path: "/chat",
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {});

    socket.on("message", (data) => {
      set((state) => ({
        chatHistory: [...state.chatHistory, data],
      }));
    });

    socket.on("updateUserCount", (data) => {
      set({ userCount: data.userCount });
    });

    socket.on("disconnect", () => {});

    return socket;
  };

  return {
    chatHistory: [],
    userCount: 0,
    isLoading: true,
    connect: () => {
      if (socket) return;
      initializeSocket();
    },

    disconnect: () => {
      socket?.disconnect();
      socket = null;
    },

    getHistory: () => {
      if (socket) {
        socket.emit("getHistory");
        socket.on("chatHistory", (data) => {
          set(() => ({
            chatHistory: data,
            isLoading: false,
          }));
        });
      } else {
        const newSocket = initializeSocket();
        newSocket.emit("getHistory");
      }
    },

    sendMessage: (message: string) => {
      if (socket) {
        socket.emit("message", { message });
      } else {
        const newSocket = initializeSocket();
        newSocket.on("connect", () => {
          newSocket.emit("message", { message });
        });
      }
    },
  };
});
