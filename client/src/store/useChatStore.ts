import { io, Socket } from "socket.io-client";
import { create } from "zustand";

import { CHAT_SERVER_URL } from "@/constants/endpoints";

import { ChatType, SendChatType } from "@/types/chat";

let socket: Socket | null = null;

type State = {
  chatHistory: ChatType[];
  userCount: number;
  isLoading: boolean;
  isConnected: boolean;
};
type Action = {
  connect: () => void;
  disconnect: () => void;
  getHistory: () => void;
  sendMessage: (message: SendChatType) => void;
};

export const useChatStore = create<State & Action>((set) => {
  const initializeSocket = () => {
    if (socket) return socket;

    socket = io(CHAT_SERVER_URL, {
      path: "/chat",
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: false,
    });

    socket.on("message", (data) => {
      set((state) => ({
        chatHistory: [...state.chatHistory, data],
      }));
    });

    socket.on("updateUserCount", (data) => {
      set({ userCount: data.userCount });
    });
    socket.on("connect", () => {
      useChatStore.setState({ isConnected: true });
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
    connect: () => {
      const s = initializeSocket();
      if (!s.connected) {
        s.connect();
      }
    },

    disconnect: () => {
      socket?.disconnect();
    },

    getHistory: () => {
      const s = initializeSocket();
      if (s.connected) {
        s.emit("getHistory");
      } else {
        s.once("connect", () => {
          s.emit("getHistory");
        });
        s.connect();
      }

      s.on("chatHistory", (data) => {
        console.log(data);
        useChatStore.setState({
          chatHistory: data,
          isLoading: false,
        });
      });
    },

    sendMessage: (message: SendChatType) => {
      const s = initializeSocket();
      if (s.connected) {
        s.emit("message", message);
      } else {
        s.once("connect", () => {
          s.emit("message", message);
        });
        s.connect();
      }
    },
  };
});
