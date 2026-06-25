import { useEffect, useRef, useState } from "react";

import { AlertTriangle, CheckSquare, Heart, MessageSquare, Search, Square } from "lucide-react";

import AdminPostDetail from "@/components/admin/post/AdminPostDetail";
import { PostCardContent } from "@/components/common/Card/PostCardContent";
import { PostCardImage } from "@/components/common/Card/PostCardImage";
import { PostGridSkeleton } from "@/components/common/Card/PostCardSkeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { useCustomToast } from "@/hooks/common/useCustomToast";
import { NO_SUMMARY_FEEDS_KEY, useBatchRequestAiSummary, useNoSummaryFeeds } from "@/hooks/queries/useAiSummaryRequest";
import { useInfiniteScrollQuery } from "@/hooks/queries/useInfiniteScrollQuery";
import { useSearch } from "@/hooks/queries/useSearch";

import { posts } from "@/api/services/posts";
import { FeedList } from "@/types/post";
import { SearchResult } from "@/types/search";
import { useQueryClient } from "@tanstack/react-query";

const SEARCH_PAGE_SIZE = 12;

const toFeedCard = (result: SearchResult): FeedList => ({
  id: result.id,
  title: result.title,
  path: result.path,
  createdAt: result.createdAt,
  author: result.author,
  blogPlatform: result.blogPlatform,
  thumbnail: result.thumbnail,
  viewCount: result.viewCount,
  tag: result.tag,
  likes: result.likes,
  comments: result.comments,
});

export default function AdminPostTab() {
  const observerTarget = useRef<HTMLDivElement>(null);
  const [selectedFeedId, setSelectedFeedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [noSummaryQuery, setNoSummaryQuery] = useState("");
  const [postQuery, setPostQuery] = useState("");

  const queryClient = useQueryClient();
  const { toast } = useCustomToast();
  const { data: noSummaryFeeds = [], isLoading: isNoSummaryLoading } = useNoSummaryFeeds();
  const { mutate: batchRequest, isPending } = useBatchRequestAiSummary();

  const trimmedPostQuery = postQuery.trim();
  const isSearching = trimmedPostQuery.length > 0;
  const { data: searchData, isLoading: isSearchLoading } = useSearch({
    query: trimmedPostQuery,
    filter: "title",
    page: 1,
    pageSize: SEARCH_PAGE_SIZE,
  });
  const searchResults = searchData?.data.result ?? [];
  const searchTotalCount = searchData?.data.totalCount ?? 0;

  const filteredNoSummaryFeeds = noSummaryFeeds.filter((feed) =>
    feed.title.toLowerCase().includes(noSummaryQuery.trim().toLowerCase())
  );

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

  const toggleSelect = (feedId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(feedId)) {
        next.delete(feedId);
      } else {
        next.add(feedId);
      }
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(filteredNoSummaryFeeds.map((feed) => feed.id)));
  const clearSelection = () => setSelectedIds(new Set());

  const handleBatchRequest = () => {
    if (selectedIds.size === 0 || isPending) return;
    batchRequest(Array.from(selectedIds), {
      onSuccess: ({ success, failed }) => {
        toast({
          title: "AI 요약 재요청 접수",
          description: failed === 0 ? `${success}개 접수되었습니다.` : `성공 ${success}개 · 실패 ${failed}개`,
        });
        clearSelection();
        queryClient.invalidateQueries({ queryKey: NO_SUMMARY_FEEDS_KEY });
      },
    });
  };

  return (
    <section className="flex flex-col gap-8 min-h-[300px]">
      {/* 상단: AI 요약 없는 게시글 - 선택 후 일괄 재요청 */}
      <div className="flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-amber-700">
            <AlertTriangle size={20} />
            AI 요약 없는 게시글 <span className="text-amber-600">{noSummaryFeeds.length}</span>
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll} disabled={isPending || noSummaryFeeds.length === 0}>
              전체 선택 ({selectedIds.size})
            </Button>
            <Button size="sm" onClick={handleBatchRequest} disabled={selectedIds.size === 0 || isPending}>
              {isPending ? "재요청 중..." : `AI 요약 재요청 (${selectedIds.size})`}
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
          <Input
            placeholder="제목으로 게시글 검색"
            className="pl-10 bg-white"
            value={noSummaryQuery}
            onChange={(event) => setNoSummaryQuery(event.target.value)}
          />
        </div>

        {isNoSummaryLoading ? (
          <p className="text-sm text-gray-400 py-6 text-center">불러오는 중...</p>
        ) : noSummaryFeeds.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">AI 요약이 없는 게시글이 없습니다.</p>
        ) : filteredNoSummaryFeeds.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">검색 결과가 없습니다.</p>
        ) : (
          <div className="max-h-[320px] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredNoSummaryFeeds.map((feed) => {
                const isSelected = selectedIds.has(feed.id);
                return (
                  <div
                    key={feed.id}
                    onClick={() => setSelectedFeedId(feed.id)}
                    className={`flex items-start gap-3 p-3 rounded-lg border-l-4 border cursor-pointer transition-colors bg-white hover:bg-amber-50 ${
                      isSelected
                        ? "ring-2 ring-amber-500 border-amber-500 border-l-amber-500"
                        : "border-amber-200 border-l-amber-400"
                    }`}
                  >
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleSelect(feed.id);
                      }}
                      aria-label={isSelected ? "선택 해제" : "선택"}
                      className="shrink-0 mt-0.5"
                    >
                      {isSelected ? (
                        <CheckSquare size={20} className="text-amber-600" />
                      ) : (
                        <Square size={20} className="text-gray-400" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          요약 없음
                        </span>
                      </div>
                      <p className="font-medium text-sm line-clamp-2 mt-1">{feed.title}</p>
                      <div className="flex gap-3 text-xs text-gray-500 mt-1.5">
                        <span className="flex items-center gap-1">
                          <Heart size={12} /> {feed.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare size={12} /> {feed.comments}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <h2 className="text-lg font-bold mb-3">{isSearching ? `검색 결과 (${searchTotalCount})` : "전체 게시글"}</h2>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="제목으로 게시글 검색"
            className="pl-10"
            value={postQuery}
            onChange={(event) => setPostQuery(event.target.value)}
          />
        </div>

        {isSearching ? (
          isSearchLoading ? (
            <PostGridSkeleton count={8} />
          ) : searchResults.length === 0 ? (
            <p className="text-sm text-gray-400 py-12 text-center">검색 결과가 없습니다.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[300px]">
              {searchResults.map((result) => {
                const post = toFeedCard(result);
                return (
                  <Card
                    key={post.id}
                    className="h-[270px] group shadow-md hover:shadow-xl transition-all duration-300 border-none rounded-xl"
                  >
                    <PostCardImage thumbnail={post.thumbnail} alt={post.title} />
                    <PostCardContent post={post} />
                  </Card>
                );
              })}
            </div>
          )
        ) : isLoading ? (
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
      </div>

      {selectedFeedId !== null && <AdminPostDetail feedId={selectedFeedId} onClose={() => setSelectedFeedId(null)} />}
    </section>
  );
}
