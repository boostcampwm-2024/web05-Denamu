import { BLOG } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { ApiData } from "@/types/api";

type GetLikeResponse = ApiData<{ isLike: boolean }>;

export const likes = {
  get: async (feedId: number): Promise<boolean> => {
    const response = await axiosInstance.get<GetLikeResponse>(BLOG.LIKE(feedId));
    return response.data.data.isLike;
  },
  create: async (feedId: number): Promise<void> => {
    await axiosInstance.post(BLOG.LIKE(feedId));
  },
  remove: async (feedId: number): Promise<void> => {
    await axiosInstance.delete(BLOG.LIKE(feedId));
  },
};
