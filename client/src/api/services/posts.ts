import { BLOG } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import {
  InfiniteScrollResponse,
  LatestFeedsApiResponse,
  FeedList,
  FeedDetailType,
  RecentFeedsApiResponse,
} from "@/types/post";

export const posts = {
  latest: async (params: {
    limit: number;
    lastId: number;
    tags: string[];
  }): Promise<InfiniteScrollResponse<FeedList>> => {
    const response = await axiosInstance.get<LatestFeedsApiResponse>(BLOG.POST, {
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
  detail: async (postId: number): Promise<FeedDetailType> => {
    const response = await axiosInstance.get<FeedDetailType>(`${BLOG.POST}/${postId}`);
    return response.data;
  },
  update: async (): Promise<RecentFeedsApiResponse> => {
    const response = await axiosInstance.get<RecentFeedsApiResponse>(BLOG.RECENT);
    return {
      message: response.data.message,
      data: response.data.data,
    };
  },
};
