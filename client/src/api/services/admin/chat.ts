import { ADMIN } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { AdminChatRoom, ChatType } from "@/types/chat";

type ApiResponse<T> = { message: string; data: T };

type AdminChatMessageResponse = {
  messageId: string;
  user: { id: string; userName: string };
  message: string;
  timestamp: string;
  room: string;
};

export const adminChat = {
  getRooms: async (): Promise<AdminChatRoom[]> => {
    const response = await axiosInstance.get<ApiResponse<AdminChatRoom[]>>(ADMIN.CHAT.ROOMS);
    return response.data.data;
  },
  getMessages: async (roomId: string): Promise<ChatType[]> => {
    const response = await axiosInstance.get<ApiResponse<AdminChatMessageResponse[]>>(
      ADMIN.CHAT.MESSAGES(roomId),
    );
    return response.data.data.map(({ user, ...rest }) => ({
      ...rest,
      userId: user.id,
      userName: user.userName,
    }));
  },
  remove: async (roomId: string, messageId: string): Promise<void> => {
    await axiosInstance.delete(ADMIN.CHAT.DELETE(roomId, messageId));
  },
};
