import { ADMIN } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { ChildAdmin, ChildAdminResponse, RegisterRequest, RegisterResponse } from "@/types/admin";

export const register = {
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await axiosInstance.post<RegisterResponse>(ADMIN.REGISTER, data);
    return response.data;
  },
  children: async (): Promise<ChildAdmin[]> => {
    const response = await axiosInstance.get<ChildAdminResponse>(ADMIN.CHILDREN);
    return response.data.data;
  },
};
