import { useState } from "react";

import { ChevronDown, FileText, Pencil, Trash2, Users } from "lucide-react";

import { BlogPlatformBadge } from "@/components/profile/rss/BlogPlatformBadge.tsx";
import { PlatformIcon } from "@/components/profile/rss/PlatformIcon.tsx";
import { RssFeedRow } from "@/components/profile/rss/RssFeedRow.tsx";
import { SubscribersModal } from "@/components/profile/rss/SubscribersModal.tsx";
import { Button } from "@/components/ui/button.tsx";

import { useCustomToast } from "@/hooks/common/useCustomToast.ts";
import { useOwnedRssFeeds, useSetFeedVisibility } from "@/hooks/queries/useRssCertification.ts";

import { CertifiedRss } from "@/types/profile.ts";

interface OwnedRssCardProps {
  rss: CertifiedRss;
  onEdit: (rss: CertifiedRss) => void;
  onDelete: (rss: CertifiedRss) => void;
}

export const OwnedRssCard = ({ rss, onEdit, onDelete }: OwnedRssCardProps) => {
  const { toast } = useCustomToast();
  const [expanded, setExpanded] = useState(false);
  const [subscribersOpen, setSubscribersOpen] = useState(false);

  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = useOwnedRssFeeds(
    rss.id,
    expanded
  );
  const visibilityMutation = useSetFeedVisibility(rss.id);

  const feeds = data?.pages.flatMap((page) => page.result) ?? [];

  const handleToggle = (feedId: number, next: boolean) => {
    visibilityMutation.mutate(
      { feedId, isPublic: next },
      {
        onError: () => toast({ title: "변경 실패", description: "다시 시도해주세요." }),
      }
    );
  };

  return (
    <li className="border border-gray-100 rounded-lg">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center min-w-0 space-x-3">
          <PlatformIcon platform={rss.blogPlatform} image={rss.blogImage} className="flex-shrink-0 w-10 h-10" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{rss.name}</p>
              <BlogPlatformBadge platform={rss.blogPlatform} className="flex-shrink-0" />
            </div>
            <p className="text-sm text-gray-500 truncate">{rss.userName}</p>
            <a
              href={rss.rssUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 truncate hover:underline"
            >
              {rss.rssUrl}
            </a>
            <p className="flex items-center gap-1 text-sm text-gray-400">
              <FileText className="w-3.5 h-3.5" />
              공개 중인 게시글 {rss.feedCount}개
            </p>
            <button
              onClick={() => setSubscribersOpen(true)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#FF870D]"
            >
              <Users className="w-3.5 h-3.5" />
              구독자 {rss.subscriberCount}명
            </button>
          </div>
        </div>
        <div className="flex flex-shrink-0 gap-1 ml-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded((prev) => !prev)}
            aria-label="게시글 목록 펼치기"
            aria-expanded={expanded}
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(rss)} aria-label="RSS 정보 수정">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(rss)}
            aria-label="RSS 소유 해제"
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 py-3 border-t border-gray-100">
          {isLoading && <p className="text-sm text-gray-400">게시글을 불러오는 중...</p>}
          {isError && <p className="text-sm text-red-500">게시글을 불러오지 못했습니다.</p>}
          {!isLoading && !isError && feeds.length === 0 && (
            <p className="text-sm text-gray-400">등록된 게시글이 없습니다.</p>
          )}

          <ul className="space-y-2">
            {feeds.map((feed) => (
              <RssFeedRow
                key={feed.id}
                id={feed.id}
                title={feed.title}
                createdAt={feed.createdAt}
                commentCount={feed.commentCount}
                likeCount={feed.likeCount}
                isPublic={feed.isPublic}
                onToggleVisibility={(next) => handleToggle(feed.id, next)}
                toggleDisabled={visibilityMutation.isPending}
              />
            ))}
          </ul>

          {hasNextPage && (
            <div className="mt-3 text-center">
              <Button variant="outline" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? "불러오는 중..." : "더 보기"}
              </Button>
            </div>
          )}
        </div>
      )}

      <SubscribersModal
        rssId={rss.id}
        rssName={rss.name}
        open={subscribersOpen}
        onClose={() => setSubscribersOpen(false)}
      />
    </li>
  );
};
