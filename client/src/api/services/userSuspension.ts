import { SUSPENSION } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { ApiData, ApiMessage } from "@/types/api";
import { CursorPage } from "@/types/profile";
import { CreateUserSuspensionPayload, SuspendedUserItem } from "@/types/userSuspension";

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
