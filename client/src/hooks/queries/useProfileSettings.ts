import { AxiosError } from "axios";

import {
  changePassword,
  requestDeleteAccount,
  updateProfile,
  updateProfileImage,
  uploadProfileImage,
} from "@/api/services/profile";
import { ApiMessage } from "@/types/api";
import { ChangePasswordPayload, UpdateProfilePayload, UploadResult } from "@/types/profile";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type ApiError = AxiosError<{ message?: string }>;

export const useUpdateProfile = (userId: number) => {
  const queryClient = useQueryClient();
  return useMutation<ApiMessage, ApiError, UpdateProfilePayload>({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
  });
};

export const useUploadProfileImage = () =>
  useMutation<UploadResult, ApiError, File>({
    mutationFn: uploadProfileImage,
  });

export const useUpdateProfileImage = (userId: number) => {
  const queryClient = useQueryClient();
  return useMutation<ApiMessage, ApiError, string>({
    mutationFn: updateProfileImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
  });
};

export const useChangePassword = () =>
  useMutation<ApiMessage, ApiError, ChangePasswordPayload>({
    mutationFn: changePassword,
  });

export const useRequestDeleteAccount = () =>
  useMutation<ApiMessage, ApiError, boolean>({
    mutationFn: requestDeleteAccount,
  });
