import { AxiosError } from "axios";

import { auth } from "@/api/services/admin/auth";
import { register } from "@/api/services/admin/register";
import { useAuthStore } from "@/store/useAuthStore";
import { RegisterRequest, RegisterResponse } from "@/types/admin";
import { AdminAuthRequest, AdminAuthResponse } from "@/types/auth";
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
