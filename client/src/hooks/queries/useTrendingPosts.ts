import { useEffect } from "react";

import { BASE_URL } from "@/constants/endpoints";
import { BLOG } from "@/constants/endpoints";

import { useBlockedRss } from "@/hooks/queries/useBlock";

import { useAuthStore } from "@/store/useAuthStore";
import { TrendingFeedsApiResponse } from "@/types/post";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useTrendingPosts = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: blockedRss = [] } = useBlockedRss(isAuthenticated);

  const query = useQuery<TrendingFeedsApiResponse>({
    queryKey: ["trending-posts"],
    queryFn: () => Promise.resolve({ message: "", data: [] }),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const eventSource = new EventSource(`${BASE_URL}${BLOG.Trend}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        queryClient.setQueryData(["trending-posts"], data);
      } catch (e) {
        console.error("SSE 데이터 파싱 에러: ", e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [queryClient]);

  const blockedRssNames = new Set(blockedRss.map((rss) => rss.name));

  return {
    ...query,
    posts: (query.data?.data || []).filter((post) => !blockedRssNames.has(post.author)),
  };
};
