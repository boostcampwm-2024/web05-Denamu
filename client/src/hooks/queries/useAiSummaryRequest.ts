import { adminFeed } from "@/api/services/admin/feed";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface BatchAiSummaryResult {
  success: number;
  failed: number;
}

export const NO_SUMMARY_FEEDS_KEY = ["admin-no-summary-feeds"];

export const useNoSummaryFeeds = () =>
  useQuery({
    queryKey: NO_SUMMARY_FEEDS_KEY,
    queryFn: adminFeed.getNoSummaryFeeds,
  });

export const useRequestAiSummary = () =>
  useMutation({
    mutationFn: (feedId: number) => adminFeed.requestAiSummary(feedId),
  });

export const useBatchRequestAiSummary = () =>
  useMutation<BatchAiSummaryResult, Error, number[]>({
    mutationFn: async (feedIds: number[]) => {
      const results = await Promise.allSettled(feedIds.map((feedId) => adminFeed.requestAiSummary(feedId)));
      return {
        success: results.filter((result) => result.status === "fulfilled").length,
        failed: results.filter((result) => result.status === "rejected").length,
      };
    },
  });
