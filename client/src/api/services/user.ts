import axios from "axios";

import { USER } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { UserSignUpRequest, UserSignUpResponse, UserSignInRequest, UserSignInResponse } from "@/types/auth";

export const register = async (data: UserSignUpRequest): Promise<UserSignUpResponse> => {
  try {
    const response = await axiosInstance.post<UserSignUpResponse>(USER.REGISTER, data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
  }
};

export const login = async (data: UserSignInRequest): Promise<UserSignInResponse> => {
  try {
    const response = await axiosInstance.post<UserSignInResponse>(USER.LOGIN, data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
  }
};

export const refreshAccessToken = async (config = {}): Promise<UserSignInResponse> => {
  const response = await axiosInstance.post<UserSignInResponse>(USER.REFRESH_TOKEN, null, config);
  return response.data;
};

export const logout = async (): Promise<{ message: string }> => {
  const response = await axiosInstance.post<{ message: string }>(USER.LOGOUT);
  return response.data;
};

export const certificateUser = async (token: string): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.post<{ message: string }>(USER.CERTIFICATE, { uuid: token });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
  }
};
