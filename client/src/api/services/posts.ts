import { BLOG } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { InfiniteScrollResponse, LatestPostsApiResponse, Post, PostDetailType } from "@/types/post";

export const posts = {
  latest: async (params: { limit: number; lastId: number; tags: string[] }): Promise<InfiniteScrollResponse<Post>> => {
    const response = await axiosInstance.get<LatestPostsApiResponse>(BLOG.POST, {
      params: {
        limit: params.limit,
        lastId: params.lastId || 0,
        tags: params.tags || [],
      },
    });
    return {
      result: response.data.data.result,
      hasMore: response.data.data.hasMore,
      lastId: response.data.data.lastId,
    };
  },
  detail: async (postId: number): Promise<PostDetailType> => {
    const response = await axiosInstance.get<PostDetailType>(`${BLOG.POST}/detail/${postId}`);
    return response.data;
  },
};
