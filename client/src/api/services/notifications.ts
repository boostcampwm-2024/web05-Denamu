import { NOTIFICATION } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { ApiData } from "@/types/api";

export type NotificationType = "LIKE" | "COMMENT" | "REPLY" | "SUBSCRIBE" | "NEW_POST";

export type NotificationItem = {
  id: number;
  type: NotificationType;
  isRead: boolean;
  updatedAt: string;
  feed: {
    id: number;
    title: string;
    path: string;
  } | null;
  rss: {
    id: number;
    name: string;
  } | null;
  actor: {
    userName: string | null;
    profileImage: string | null;
  };
  otherCount: number;
  commentPreview: string | null;
  commentId: number | null;
};

type GetUnreadCountResponse = ApiData<{ count: number }>;
type GetNotificationsResponse = ApiData<{ result: NotificationItem[] }>;

export const notifications = {
  getUnreadCount: async (): Promise<number> => {
    const response = await axiosInstance.get<GetUnreadCountResponse>(NOTIFICATION.UNREAD_COUNT);
    return response.data.data.count;
  },
  getList: async (): Promise<NotificationItem[]> => {
    const response = await axiosInstance.get<GetNotificationsResponse>(NOTIFICATION.LIST);
    return response.data.data.result;
  },
  markRead: async (id: number): Promise<void> => {
    await axiosInstance.patch(NOTIFICATION.READ(id));
  },
};
