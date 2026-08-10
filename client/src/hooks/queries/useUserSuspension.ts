import { createUserSuspension, getSuspendedUsers } from "@/api/services/userSuspension";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const PAGE_SIZE = 10;

export const useSuspendedUsers = () =>
  useInfiniteQuery({
    queryKey: ["adminUserSuspensions"],
    queryFn: ({ pageParam }: { pageParam: number | undefined }) =>
      getSuspendedUsers({ lastId: pageParam, limit: PAGE_SIZE }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.lastId : undefined),
    initialPageParam: undefined as number | undefined,
  });

export const useCreateUserSuspension = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUserSuspension,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUserSuspensions"] });
    },
  });
};
