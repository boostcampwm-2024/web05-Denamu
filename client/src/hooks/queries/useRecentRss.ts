import { getRecentRss } from "@/api/services/rss";
import { useQuery } from "@tanstack/react-query";

export const useRecentRss = () =>
  useQuery({
    queryKey: ["recentRss"],
    queryFn: getRecentRss,
  });
