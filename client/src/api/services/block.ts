import { BLOCK } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";

import { ApiData, ApiMessage } from "@/types/api";
import { BlockedRss, BlockedUser } from "@/types/profile";

export const getBlockedUsers = async (): Promise<BlockedUser[]> => {
  const response = await axiosInstance.get<ApiData<BlockedUser[]>>(BLOCK.LIST);
  return response.data.data;
};

export const blockUser = async (userId: number): Promise<ApiMessage> => {
  const response = await axiosInstance.post<ApiMessage>(BLOCK.MANAGE(userId));
  return response.data;
};

export const unblockUser = async (userId: number): Promise<ApiMessage> => {
  const response = await axiosInstance.delete<ApiMessage>(BLOCK.MANAGE(userId));
  return response.data;
};

export const getBlockedRss = async (): Promise<BlockedRss[]> => {
  const response = await axiosInstance.get<ApiData<BlockedRss[]>>(BLOCK.RSS_LIST);
  return response.data.data;
};

export const blockRss = async (rssId: number): Promise<ApiMessage> => {
  const response = await axiosInstance.post<ApiMessage>(BLOCK.RSS_MANAGE(rssId));
  return response.data;
};

export const unblockRss = async (rssId: number): Promise<ApiMessage> => {
  const response = await axiosInstance.delete<ApiMessage>(BLOCK.RSS_MANAGE(rssId));
  return response.data;
};
