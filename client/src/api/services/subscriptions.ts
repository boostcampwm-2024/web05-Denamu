import { SUBSCRIPTION } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { ApiData } from "@/types/api";
import { FeedList, InfiniteScrollResponse } from "@/types/post";
import { CursorPage } from "@/types/profile";
import { SubscribedRss, Subscriber } from "@/types/subscription";

export const subscriptions = {
  create: async (rssId: number): Promise<void> => {
    await axiosInstance.post(SUBSCRIPTION.CREATE(rssId));
  },
  remove: async (rssId: number): Promise<void> => {
    await axiosInstance.delete(SUBSCRIPTION.REMOVE(rssId));
  },
  byUser: async (userId: number): Promise<SubscribedRss[]> => {
    const response = await axiosInstance.get<ApiData<SubscribedRss[]>>(SUBSCRIPTION.BY_USER(userId));
    return response.data.data;
  },
  subscribers: async (rssId: number, lastId?: number, limit = 10): Promise<CursorPage<Subscriber>> => {
    const response = await axiosInstance.get<ApiData<CursorPage<Subscriber>>>(SUBSCRIPTION.SUBSCRIBERS(rssId), {
      params: { lastId, limit },
    });
    return response.data.data;
  },
  feed: async (params: { limit: number; lastId: number; tags: string[] }): Promise<InfiniteScrollResponse<FeedList>> => {
    const response = await axiosInstance.get<ApiData<InfiniteScrollResponse<FeedList>>>(SUBSCRIPTION.FEED, {
      params: {
        limit: params.limit,
        lastId: params.lastId || 0,
      },
    });
    return {
      result: response.data.data.result,
      hasMore: response.data.data.hasMore,
      lastId: response.data.data.lastId,
    };
  },
};
