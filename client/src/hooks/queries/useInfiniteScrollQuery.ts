import { InfiniteScrollResponse } from "@/types/post";
import { useInfiniteQuery } from "@tanstack/react-query";

interface Identifiable {
  id: number;
}

interface UseInfiniteScrollQueryOptions<T extends Identifiable> {
  queryKey: string;
  fetchFn: (params: { limit: number; lastId: number; tags: string[] }) => Promise<InfiniteScrollResponse<T>>;
  tags: string[];
}

export function useInfiniteScrollQuery<T extends Identifiable>({
  queryKey,
  fetchFn,
  tags,
}: UseInfiniteScrollQueryOptions<T>) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } = useInfiniteQuery({
    queryKey: [queryKey, tags],
    queryFn: ({ pageParam = 0 }) =>
      fetchFn({
        limit: 12,
        lastId: pageParam,
        tags: tags || [],
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      const lastItem = lastPage.result[lastPage.result.length - 1];
      return lastItem.id;
    },
    initialPageParam: 0,
  });

  const items = data?.pages.flatMap((page) => page.result) ?? [];

  return {
    items,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    error,
  };
}
