import { FILE, PROFILE, USER } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";

import { ApiData, ApiMessage } from "@/types/api";

import {
  CertifiedRss,
  CommentItem,
  CursorPage,
  LikedItem,
  ProfileActivity,
  UpdateProfilePayload,
  UploadResult,
  UserProfile,
  ChangePasswordPayload
} from "@/types/profile";

export const getProfile = async (userId: number): Promise<UserProfile> => {
  const response = await axiosInstance.get<ApiData<UserProfile>>(PROFILE.PROFILE(userId));
  return response.data.data;
};

export const getActivities = async (userId: number, year: number): Promise<ProfileActivity> => {
  const response = await axiosInstance.get<ApiData<ProfileActivity>>(PROFILE.ACTIVITIES(userId), {
    params: { year },
  });
  return response.data.data;
};

export const getActivityYears = async (userId: number): Promise<number[]> => {
  const response = await axiosInstance.get<ApiData<number[]>>(PROFILE.ACTIVITY_YEARS(userId));
  return response.data.data;
};

export const getCertifiedRss = async (userId: number): Promise<CertifiedRss[]> => {
  const response = await axiosInstance.get<ApiData<CertifiedRss[]>>(PROFILE.RSS(userId));
  return response.data.data;
};

export const getUserLikes = async (userId: number, lastId?: number, limit = 10): Promise<CursorPage<LikedItem>> => {
  const response = await axiosInstance.get<ApiData<CursorPage<LikedItem>>>(PROFILE.LIKES(userId), {
    params: { lastId, limit },
  });
  return response.data.data;
};

export const getUserComments = async (
  userId: number,
  lastId?: number,
  limit = 10
): Promise<CursorPage<CommentItem>> => {
  const response = await axiosInstance.get<ApiData<CursorPage<CommentItem>>>(PROFILE.COMMENTS(userId), {
    params: { lastId, limit },
  });
  return response.data.data;
};

export const updateProfile = async (payload: UpdateProfilePayload): Promise<ApiMessage> => {
  const response = await axiosInstance.patch<ApiMessage>(PROFILE.UPDATE, payload);
  return response.data;
};

export const checkUserNameAvailability = async (userName: string): Promise<boolean> => {
  const response = await axiosInstance.get<ApiData<{ exists: boolean }>>(USER.USERNAME_AVAILABILITY, {
    params: { userName },
  });
  return response.data.data.exists;
};

export const uploadProfileImage = async (file: File): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post<ApiData<UploadResult>>(FILE.UPLOAD, formData, {
    params: { uploadType: "PROFILE_IMAGE" },
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

export const changePassword = async (payload: ChangePasswordPayload): Promise<ApiMessage> => {
  const response = await axiosInstance.patch<ApiMessage>(USER.PASSWORD, payload);
  return response.data;
};

export const requestDeleteAccount = async (deleteRss: boolean): Promise<ApiMessage> => {
  const response = await axiosInstance.post<ApiMessage>(USER.DELETE_REQUEST, { deleteRss });
  return response.data;
};
