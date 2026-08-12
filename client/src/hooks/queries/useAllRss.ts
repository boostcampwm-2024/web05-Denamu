import { getAllRss } from "@/api/services/rss";
import { useQuery } from "@tanstack/react-query";

export const useAllRss = (page: number, limit: number, blogPlatform?: string) => {
  return useQuery({
    queryKey: ["allRss", page, limit, blogPlatform],
    queryFn: () => getAllRss(page, limit, blogPlatform),
  });
};
