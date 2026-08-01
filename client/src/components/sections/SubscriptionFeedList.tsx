import InfiniteFeedGrid from "@/components/sections/InfiniteFeedGrid";

import { useSubscriptionFeed } from "@/hooks/queries/useSubscriptionFeed";

export default function SubscriptionFeedList() {
  const { items, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useSubscriptionFeed();

  return (
    <InfiniteFeedGrid
      items={items}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      emptyMessage="구독한 블로그의 게시글이 없습니다. 관심 있는 블로그를 구독해보세요."
    />
  );
}
