import { ADMIN } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { RegisterRequest, RegisterResponse } from "@/types/admin";

export const register = {
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await axiosInstance.post<RegisterResponse>(ADMIN.REGISTER, data);
    return response.data;
  },
};
