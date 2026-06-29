import axios from "axios";

import { USER, OAUTH } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { ApiMessage } from "@/types/api";
import { UserSignUpRequest, UserSignUpResponse, UserSignInRequest, UserSignInResponse } from "@/types/auth";

export const completeOAuthRegistration = async (userName: string): Promise<ApiMessage> => {
  const response = await axiosInstance.post<ApiMessage>(OAUTH.REGISTER, { userName });
  return response.data;
};

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

export const logout = async (): Promise<ApiMessage> => {
  const response = await axiosInstance.post<ApiMessage>(USER.LOGOUT);
  return response.data;
};

export const certificateUser = async (token: string): Promise<ApiMessage> => {
  try {
    const response = await axiosInstance.post<ApiMessage>(USER.CERTIFICATE, { uuid: token });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
  }
};

export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.post<{ message: string }>(USER.PASSWORD_RESET, { email });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
  }
};

export const changePassword = async (uuid: string, password: string): Promise<{ message: string }> => {
  try {
    const response = await axiosInstance.patch<{ message: string }>(USER.PASSWORD_RESET_CONFIRM(uuid), { password });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
  }
};

export const confirmDeleteAccount = async (token: string): Promise<ApiMessage> => {
  const response = await axiosInstance.delete<ApiMessage>(USER.WITHDRAW_CONFIRM(token));
  return response.data;
};
