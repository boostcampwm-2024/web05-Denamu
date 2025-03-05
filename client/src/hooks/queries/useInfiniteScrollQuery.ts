import { InfiniteScrollResponse } from "@/types/post";
import { useInfiniteQuery } from "@tanstack/react-query";

interface Identifiable {
  id: number;
}

interface UseInfiniteScrollQueryOptions<T extends Identifiable> {
  queryKey: string;
  fetchFn: (params: { limit: number; lastId: number }) => Promise<InfiniteScrollResponse<T>>;
}

export function useInfiniteScrollQuery<T extends Identifiable>({
  queryKey,
  fetchFn,
}: UseInfiniteScrollQueryOptions<T>) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } = useInfiniteQuery({
    queryKey: [queryKey],
    queryFn: ({ pageParam = 0 }) =>
      fetchFn({
        limit: 12,
        lastId: pageParam,
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
