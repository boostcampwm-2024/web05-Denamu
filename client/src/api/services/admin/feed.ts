import { BLOG } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { NoSummaryFeed, NoSummaryFeedsApiResponse } from "@/types/post";

export const adminFeed = {
  getNoSummaryFeeds: async (): Promise<NoSummaryFeed[]> => {
    const response = await axiosInstance.get<NoSummaryFeedsApiResponse>(BLOG.NO_SUMMARY);
    return response.data.data;
  },
  requestAiSummary: async (feedId: number): Promise<void> => {
    await axiosInstance.post(BLOG.AI_SUMMARY(feedId));
  },
};
