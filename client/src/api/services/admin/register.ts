import { ADMIN } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import {
  ChildAdmin,
  ChildAdminResponse,
  DeleteChildResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/types/admin";

export const register = {
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await axiosInstance.post<RegisterResponse>(ADMIN.REGISTER, data);
    return response.data;
  },
  children: async (): Promise<ChildAdmin[]> => {
    const response = await axiosInstance.get<ChildAdminResponse>(ADMIN.CHILDREN);
    return response.data.data;
  },
  deleteChild: async (id: number): Promise<DeleteChildResponse> => {
    const response = await axiosInstance.delete<DeleteChildResponse>(ADMIN.DELETE_CHILD(id));
    return response.data;
  },
};
