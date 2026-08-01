import { subscriptions } from "@/api/services/subscriptions";
import { QueryKey, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const userSubscriptionsKey = ["userSubscriptions"];

export const useUserSubscriptions = (userId: number, enabled = true) =>
  useQuery({
    queryKey: [...userSubscriptionsKey, userId],
    queryFn: () => subscriptions.byUser(userId),
    enabled: enabled && userId > 0,
  });

export const useBlogSubscribers = (rssId: number, enabled: boolean) =>
  useInfiniteQuery({
    queryKey: ["subscribers", rssId],
    queryFn: ({ pageParam }) => subscriptions.subscribers(rssId, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.lastId : undefined),
    enabled: enabled && rssId > 0,
  });

export const useToggleSubscription = (rssId: number, invalidateKeys: QueryKey[] = []) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isSubscribed: boolean) => (isSubscribed ? subscriptions.remove(rssId) : subscriptions.create(rssId)),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userSubscriptionsKey });
      queryClient.invalidateQueries({ queryKey: ["subscriptionFeed"] });
      invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    },
  });
};
