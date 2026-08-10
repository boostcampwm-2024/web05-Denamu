import { SUSPENSION } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { ApiData } from "@/types/api";
import { CursorPage } from "@/types/profile";
import { SuspendedUserItem } from "@/types/userSuspension";

export interface GetSuspendedUsersParams {
  lastId?: number;
  limit?: number;
}

export const getSuspendedUsers = async (params: GetSuspendedUsersParams): Promise<CursorPage<SuspendedUserItem>> => {
  const response = await axiosInstance.get<ApiData<CursorPage<SuspendedUserItem>>>(SUSPENSION.ADMIN_LIST, { params });
  return response.data.data;
};
