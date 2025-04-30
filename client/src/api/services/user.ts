import { USER } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";

interface RegisterRequest {
  email: string;
  password: string;
  userName: string;
}

interface RegisterResponse {
  message: string;
}

export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const response = await axiosInstance.post<RegisterResponse>(USER.REGISTER, data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw error;
    }
    throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
  }
};
