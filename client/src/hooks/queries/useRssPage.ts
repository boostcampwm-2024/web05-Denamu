import { getRssActivities, getRssActivityYears, getRssInfo, getRssPageFeeds } from "@/api/services/rss";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export const useRssInfo = (rssId: number) =>
  useQuery({
    queryKey: ["rssInfo", rssId],
    queryFn: () => getRssInfo(rssId),
    enabled: !!rssId,
  });

export const useRssPageFeeds = (rssId: number) =>
  useInfiniteQuery({
    queryKey: ["rssPageFeeds", rssId],
    queryFn: ({ pageParam }) => getRssPageFeeds(rssId, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.lastId : undefined),
    enabled: !!rssId,
  });

export const useRssActivities = (rssId: number, year: number) =>
  useQuery({
    queryKey: ["rssActivities", rssId, year],
    queryFn: () => getRssActivities(rssId, year),
    enabled: !!rssId,
  });

export const useRssActivityYears = (rssId: number) =>
  useQuery({
    queryKey: ["rssActivityYears", rssId],
    queryFn: () => getRssActivityYears(rssId),
    enabled: !!rssId,
  });
