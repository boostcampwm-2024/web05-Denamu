import { Rss } from "lucide-react";

import { PostCardGrid } from "@/components/common/Card/PostCardGrid";
import { PostGridSkeleton } from "@/components/common/Card/PostCardSkeleton.tsx";
import { SectionHeader } from "@/components/common/SectionHeader";

import { usePerformanceMeasure } from "@/hooks/common/usePerformanceMeasure";
import { useScrollInfiniteRaw } from "@/hooks/common/useScrollInfiniteRaw";
import { useInfiniteScrollQuery } from "@/hooks/queries/useInfiniteScrollQuery";

import { posts } from "@/api/services/posts";
import { Post } from "@/types/post";

export default function LatestSectionWithScrollRaw() {
  const { items, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteScrollQuery<Post>({
    queryKey: "latest-posts-raw",
    fetchFn: posts.latest,
  });

  usePerformanceMeasure(true);

  const { isNearBottom } = useScrollInfiniteRaw(fetchNextPage, hasNextPage, isFetchingNextPage, 0.8);

  return (
    <section className="flex flex-col p-4 min-h-[300px]">
      <SectionHeader
        icon={Rss}
        text="최신 포스트 (순수 Scroll Event)"
        description="스로틀링 없는 스크롤 이벤트 기반"
        iconColor="text-red-500"
      />
      <div className="flex-1 mt-4 p-4 rounded-lg">
        {isLoading ? (
          <PostGridSkeleton count={8} />
        ) : (
          <>
            <PostCardGrid posts={items} />
            {isFetchingNextPage && (
              <div className="mt-8">
                <PostGridSkeleton count={4} />
              </div>
            )}
            <div className="h-10">
              {isNearBottom && !isFetchingNextPage && hasNextPage && (
                <p className="text-center text-gray-500">다음 페이지 로딩 중...</p>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
