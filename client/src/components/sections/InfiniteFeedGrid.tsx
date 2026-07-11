import { useEffect, useRef } from "react";

import { PostCardGrid } from "@/components/common/Card/PostCardGrid";
import { PostGridSkeleton } from "@/components/common/Card/PostCardSkeleton.tsx";

import { FeedList } from "@/types/post";

interface InfiniteFeedGridProps {
  items: FeedList[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  emptyMessage?: string;
}

export default function InfiniteFeedGrid({
  items,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  emptyMessage,
}: InfiniteFeedGridProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.3, rootMargin: "100px" }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return <PostGridSkeleton count={8} />;
  }

  if (emptyMessage && items.length === 0) {
    return <p className="py-16 text-center text-sm text-gray-400">{emptyMessage}</p>;
  }

  return (
    <>
      <PostCardGrid posts={items} />
      {isFetchingNextPage && (
        <div className="mt-8">
          <PostGridSkeleton count={4} />
        </div>
      )}
      <div ref={observerTarget} className="h-10" />
    </>
  );
}
