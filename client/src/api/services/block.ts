import { BLOCK } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";

import { ApiData, ApiMessage } from "@/types/api";
import { BlockedUser } from "@/types/profile";

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
