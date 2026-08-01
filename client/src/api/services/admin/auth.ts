import { ADMIN } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { ApiMessage } from "@/types/api";
import {
  AdminAuthRequest,
  AdminAuthResponse,
  AdminForgotPasswordRequest,
  AdminProfileResponse,
  AdminResetPasswordRequest,
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
  logout: async (): Promise<ApiMessage> => {
    const response = await axiosInstance.post<ApiMessage>(ADMIN.LOGOUT);
    return response.data;
  },
  requestWithdraw: async (): Promise<ApiMessage> => {
    const response = await axiosInstance.post<ApiMessage>(ADMIN.WITHDRAW_REQUEST);
    return response.data;
  },
  confirmWithdraw: async (token: string): Promise<ApiMessage> => {
    const response = await axiosInstance.delete<ApiMessage>(ADMIN.WITHDRAW_CONFIRM(token));
    return response.data;
  },
  forgotPassword: async (data: AdminForgotPasswordRequest): Promise<ApiMessage> => {
    const response = await axiosInstance.post<ApiMessage>(ADMIN.PASSWORD_RESET_REQUEST, data);
    return response.data;
  },
  resetPassword: async ({ token, password }: AdminResetPasswordRequest): Promise<ApiMessage> => {
    const response = await axiosInstance.patch<ApiMessage>(ADMIN.PASSWORD_RESET_CONFIRM(token), {
      password,
    });
    return response.data;
  },
};
