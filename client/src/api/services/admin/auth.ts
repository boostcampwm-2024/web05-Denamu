import { ADMIN } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { AdminAuthRequest, AdminAuthResponse } from "@/types/auth";

export const auth = {
  login: async (data: AdminAuthRequest): Promise<AdminAuthResponse> => {
    const response = await axiosInstance.post<AdminAuthResponse>(ADMIN.LOGIN, data);
    return response.data;
  },
  check: async (): Promise<number> => {
    const response = await axiosInstance.get<AdminAuthResponse>(ADMIN.CHECK);
    return response.status;
  },
  logout: async (): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>(ADMIN.LOGOUT);
    return response.data;
  },
};
