import { ADMIN } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { AuthApiRequest, AuthApiResponse } from "@/types/auth";

export const auth = {
  login: async (data: AuthApiRequest): Promise<AuthApiResponse> => {
    const response = await axiosInstance.post<AuthApiResponse>(ADMIN.LOGIN, data);
    return response.data;
  },
  check: async (): Promise<number> => {
    const response = await axiosInstance.get<AuthApiResponse>(ADMIN.CHECK);
    return response.status;
  },
  logout: async (): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>(ADMIN.LOGOUT);
    return response.data;
  },
};
