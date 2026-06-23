import { useEffect, useRef, useState } from "react";

import AdminPostDetail from "@/components/admin/post/AdminPostDetail";
import { PostCardContent } from "@/components/common/Card/PostCardContent";
import { PostCardImage } from "@/components/common/Card/PostCardImage";
import { PostGridSkeleton } from "@/components/common/Card/PostCardSkeleton";
import { Card } from "@/components/ui/card";

import { useInfiniteScrollQuery } from "@/hooks/queries/useInfiniteScrollQuery";

import { posts } from "@/api/services/posts";
import { FeedList } from "@/types/post";

export default function AdminPostTab() {
  const observerTarget = useRef<HTMLDivElement>(null);
  const [selectedFeedId, setSelectedFeedId] = useState<number | null>(null);

  const { items, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteScrollQuery<FeedList>({
    queryKey: "admin-latest-posts",
    fetchFn: posts.latest,
    tags: [],
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.3, rootMargin: "100px" }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <section className="flex flex-col min-h-[300px]">
      {isLoading ? (
        <PostGridSkeleton count={8} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[300px]">
            {items.map((post) => (
              <Card
                key={post.id}
                onClick={() => setSelectedFeedId(post.id)}
                className="h-[270px] group shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 border-none rounded-xl cursor-pointer"
              >
                <PostCardImage thumbnail={post.thumbnail} alt={post.title} isNew={post.isNew} />
                <PostCardContent post={post} />
              </Card>
            ))}
          </div>
          {isFetchingNextPage && (
            <div className="mt-8">
              <PostGridSkeleton count={4} />
            </div>
          )}
          <div ref={observerTarget} className="h-10" />
        </>
      )}

      {selectedFeedId !== null && (
        <AdminPostDetail feedId={selectedFeedId} onClose={() => setSelectedFeedId(null)} />
      )}
    </section>
  );
}
