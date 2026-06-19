import { PROFILE } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { CertifiedRss, CommentItem, CursorPage, LikedItem, ProfileActivity, UserProfile } from "@/types/profile";

interface ApiData<T> {
  message: string;
  data: T;
}

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
