import { USER } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { UserSignUpRequest, UserSignUpResponse } from "@/types/auth";

export const register = async (data: UserSignUpRequest): Promise<UserSignUpResponse> => {
  try {
    const response = await axiosInstance.post<UserSignUpResponse>(USER.REGISTER, data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw error;
    }
    throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
  }
};
