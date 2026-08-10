import { getSuspendedUsers } from "@/api/services/userSuspension";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 10;

export const useSuspendedUsers = () =>
  useInfiniteQuery({
    queryKey: ["adminUserSuspensions"],
    queryFn: ({ pageParam }: { pageParam: number | undefined }) =>
      getSuspendedUsers({ lastId: pageParam, limit: PAGE_SIZE }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.lastId : undefined),
    initialPageParam: undefined as number | undefined,
  });
