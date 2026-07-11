import { subscriptions } from "@/api/services/subscriptions";
import { useInfiniteScrollQuery } from "@/hooks/queries/useInfiniteScrollQuery";
import { FeedList } from "@/types/post";

export const useSubscriptionFeed = () =>
  useInfiniteScrollQuery<FeedList>({
    queryKey: "subscriptionFeed",
    fetchFn: subscriptions.feed,
    tags: [],
  });
