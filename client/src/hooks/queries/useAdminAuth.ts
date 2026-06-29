import { AxiosError } from "axios";

import { auth } from "@/api/services/admin/auth";
import { register } from "@/api/services/admin/register";
import { useAuthStore } from "@/store/useAuthStore";
import { DeleteChildResponse, RegisterRequest, RegisterResponse } from "@/types/admin";
import {
  AdminAuthRequest,
  AdminAuthResponse,
  AdminForgotPasswordRequest,
  AdminResetPasswordRequest,
  AdminUpdateRequest,
  AdminUpdateResponse,
} from "@/types/auth";
import { ApiMessage } from "@/types/api";
import { useMutation, UseMutationResult, useQuery, useQueryClient } from "@tanstack/react-query";

export const useAdminAuth = (
  onSuccess: (data: AdminAuthResponse) => void,
  onError: (error: AxiosError<unknown, unknown>) => void
): UseMutationResult<AdminAuthResponse, AxiosError<unknown, unknown>, AdminAuthRequest, unknown> => {
  const setRole = useAuthStore((state) => state.setRole);
  const queryClient = useQueryClient();
  return useMutation<AdminAuthResponse, AxiosError<unknown, unknown>, AdminAuthRequest>({
    mutationFn: async (data) => {
      const response = await auth.login(data);
      setRole("admin");
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["adminCheck"] });
      onSuccess(data);
    },
    onError,
  });
};
export const useAdminCheck = () => {
  const { status, isLoading, error, data } = useQuery({
    queryKey: ["adminCheck"],
    queryFn: auth.me,
    retry: 1,
  });
  return { status, isLoading, error, data };
};

export const useAdminUpdate = (
  onSuccess: (data: AdminUpdateResponse) => void,
  onError: (error: AxiosError<unknown, unknown>) => void
): UseMutationResult<AdminUpdateResponse, AxiosError<unknown, unknown>, AdminUpdateRequest, unknown> => {
  const queryClient = useQueryClient();
  return useMutation<AdminUpdateResponse, AxiosError<unknown, unknown>, AdminUpdateRequest>({
    mutationFn: (data) => auth.updateProfile(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["adminCheck"] });
      onSuccess(data);
    },
    onError,
  });
};

export const useAdminWithdraw = (
  onSuccess: (data: { message: string }) => void,
  onError: (error: AxiosError<unknown, unknown>) => void
): UseMutationResult<{ message: string }, AxiosError<unknown, unknown>, void, unknown> => {
  return useMutation<{ message: string }, AxiosError<unknown, unknown>, void>({
    mutationFn: () => auth.requestWithdraw(),
    onSuccess,
    onError,
  });
};

export const useAdminForgotPassword = (
  onSuccess: (data: ApiMessage) => void,
  onError: (error: AxiosError<unknown, unknown>) => void
): UseMutationResult<ApiMessage, AxiosError<unknown, unknown>, AdminForgotPasswordRequest, unknown> => {
  return useMutation<ApiMessage, AxiosError<unknown, unknown>, AdminForgotPasswordRequest>({
    mutationFn: (data) => auth.forgotPassword(data),
    onSuccess,
    onError,
  });
};

export const useAdminResetPassword = (
  onSuccess: (data: ApiMessage) => void,
  onError: (error: AxiosError<unknown, unknown>) => void
): UseMutationResult<ApiMessage, AxiosError<unknown, unknown>, AdminResetPasswordRequest, unknown> => {
  return useMutation<ApiMessage, AxiosError<unknown, unknown>, AdminResetPasswordRequest>({
    mutationFn: (data) => auth.resetPassword(data),
    onSuccess,
    onError,
  });
};

export const useAdminRegister = (
  onSuccess: (data: RegisterResponse) => void,
  onError: (error: AxiosError<unknown, unknown>) => void
): UseMutationResult<RegisterResponse, AxiosError<unknown, unknown>, RegisterRequest, unknown> => {
  const queryClient = useQueryClient();
  return useMutation<RegisterResponse, AxiosError<unknown, unknown>, RegisterRequest>({
    mutationFn: async (data) => {
      const response = await register.register(data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["adminChildren"] });
      onSuccess(data);
    },
    onError,
  });
};

export const useAdminChildren = () => {
  return useQuery({
    queryKey: ["adminChildren"],
    queryFn: register.children,
  });
};

export const useAdminChildDelete = (
  onSuccess: (data: DeleteChildResponse) => void,
  onError: (error: AxiosError<unknown, unknown>) => void
): UseMutationResult<DeleteChildResponse, AxiosError<unknown, unknown>, number, unknown> => {
  const queryClient = useQueryClient();
  return useMutation<DeleteChildResponse, AxiosError<unknown, unknown>, number>({
    mutationFn: (id) => register.deleteChild(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["adminChildren"] });
      onSuccess(data);
    },
    onError,
  });
};
