import { SUSPENSION } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { ApiData, ApiMessage } from "@/types/api";
import { CursorPage } from "@/types/profile";
import { CreateUserSuspensionPayload, SuspendedUserItem, UpdateUserSuspensionPayload } from "@/types/userSuspension";

export interface GetSuspendedUsersParams {
  lastId?: number;
  limit?: number;
}

export const getSuspendedUsers = async (params: GetSuspendedUsersParams): Promise<CursorPage<SuspendedUserItem>> => {
  const response = await axiosInstance.get<ApiData<CursorPage<SuspendedUserItem>>>(SUSPENSION.ADMIN_LIST, { params });
  return response.data.data;
};

export const createUserSuspension = async (payload: CreateUserSuspensionPayload): Promise<ApiMessage> => {
  const response = await axiosInstance.post<ApiMessage>(SUSPENSION.ADMIN_LIST, payload);
  return response.data;
};

export const updateUserSuspension = async ({
  userId,
  ...payload
}: UpdateUserSuspensionPayload): Promise<ApiMessage> => {
  const response = await axiosInstance.patch<ApiMessage>(SUSPENSION.ADMIN_UPDATE(userId), payload);
  return response.data;
};

export const deleteUserSuspension = async (userId: number): Promise<ApiMessage> => {
  const response = await axiosInstance.delete<ApiMessage>(SUSPENSION.ADMIN_UPDATE(userId));
  return response.data;
};
