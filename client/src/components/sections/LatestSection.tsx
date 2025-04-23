import { useEffect, useRef } from "react";

import { Rss, SquareX } from "lucide-react";

import { PostCardGrid } from "@/components/common/Card/PostCardGrid";
import { PostGridSkeleton } from "@/components/common/Card/PostCardSkeleton.tsx";
import { SectionHeader } from "@/components/common/SectionHeader";
import Filter from "@/components/filter/Filter";

import { useRecentTag } from "@/hooks/common/useRecentTag";
import { useInfiniteScrollQuery } from "@/hooks/queries/useInfiniteScrollQuery";

import { Badge } from "../ui/badge";
import { posts } from "@/api/services/posts";
import { useFilterStore } from "@/store/useFilterStore";
import { usePostTypeStore } from "@/store/usePostTypeStore";
import { Post } from "@/types/post";

export default function LatestSection() {
  const pickedFilter = useFilterStore((state) => state.filters);
  const removeFilter = useFilterStore((state) => state.removeAll);
  const observerTarget = useRef<HTMLDivElement>(null);
  const postType = usePostTypeStore((state) => state.postType);
  const recentTags = useRecentTag();
  const tags = postType === "latest" ? pickedFilter : recentTags;

  const { items, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteScrollQuery<Post>({
    queryKey: "latest-posts",
    fetchFn: posts.latest,
    tags: tags,
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

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <section className="flex flex-col md:p-4 min-h-[300px]">
      <div className="flex items-center gap-3">
        <SectionHeader
          icon={Rss}
          text="최신 포스트"
          description="최근에 작성된 포스트"
          iconColor="text-orange-500"
          secondText="추천 포스트"
          secondDescription="사용자 맞춤 추천 포스트"
        />
        {pickedFilter.length !== 0 && postType === "latest" && (
          <div className=" gap-2 items-center hidden md:flex">
            <ul className="flex flex-wrap gap-x-2 gap-y-2">
              {pickedFilter.map((filter, index) => (
                <Badge key={index} className="hover:bg-primary">
                  {filter}
                </Badge>
              ))}
            </ul>
            <button onClick={removeFilter}>
              <SquareX size={13} color="red" />
            </button>

            <span className="text-gray-400 text-xs">카테고리 지정은 최대 5개까지 가능합니다.</span>
          </div>
        )}
      </div>
      {postType === "latest" && <Filter />}
      <div className="flex-1 mt-4 md:p-6 md:pt-0 rounded-lg">
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
            <div ref={observerTarget} className="h-10" />
          </>
        )}
      </div>
    </section>
  );
}
