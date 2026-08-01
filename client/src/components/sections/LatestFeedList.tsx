import InfiniteFeedGrid from "@/components/sections/InfiniteFeedGrid";

import { useInfiniteScrollQuery } from "@/hooks/queries/useInfiniteScrollQuery";

import { posts } from "@/api/services/posts";
import { FeedList } from "@/types/post";

interface LatestFeedListProps {
  tags: string[];
}

export default function LatestFeedList({ tags }: LatestFeedListProps) {
  const { items, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteScrollQuery<FeedList>({
    queryKey: "latest-posts",
    fetchFn: posts.latest,
    tags,
  });

  return (
    <InfiniteFeedGrid
      items={items}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
}
