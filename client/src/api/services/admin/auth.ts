import { ADMIN } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import {
  AdminAuthRequest,
  AdminAuthResponse,
  AdminProfileResponse,
  AdminUpdateRequest,
  AdminUpdateResponse,
} from "@/types/auth";

export const auth = {
  login: async (data: AdminAuthRequest): Promise<AdminAuthResponse> => {
    const response = await axiosInstance.post<AdminAuthResponse>(ADMIN.LOGIN, data);
    return response.data;
  },
  me: async (): Promise<AdminProfileResponse["data"]> => {
    const response = await axiosInstance.get<AdminProfileResponse>(ADMIN.ME);
    return response.data.data;
  },
  updateProfile: async (data: AdminUpdateRequest): Promise<AdminUpdateResponse> => {
    const response = await axiosInstance.patch<AdminUpdateResponse>(ADMIN.UPDATE_ME, data);
    return response.data;
  },
  logout: async (): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>(ADMIN.LOGOUT);
    return response.data;
  },
};
