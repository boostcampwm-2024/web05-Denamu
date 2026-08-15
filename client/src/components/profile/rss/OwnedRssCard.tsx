import { useState } from "react";

import { ChevronDown, FileText, Pencil, ShieldAlert, Trash2, Users } from "lucide-react";

import { BlogPlatformBadge } from "@/components/profile/rss/BlogPlatformBadge.tsx";
import { PlatformIcon } from "@/components/profile/rss/PlatformIcon.tsx";
import { RssFeedRow } from "@/components/profile/rss/RssFeedRow.tsx";
import { SubscribersModal } from "@/components/profile/rss/SubscribersModal.tsx";
import { Button } from "@/components/ui/button.tsx";

import { useCustomToast } from "@/hooks/common/useCustomToast.ts";
import { useOwnedRssFeeds, useSetFeedVisibility } from "@/hooks/queries/useRssCertification.ts";

import { CertifiedRss } from "@/types/profile.ts";

const getSuspensionColor = (count: number) => {
  if (count >= 3) return "text-red-500";
  if (count === 2) return "text-orange-500";
  if (count === 1) return "text-yellow-500";
  return "text-gray-400";
};

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
    <li className="border-0 md:border border-gray-100 rounded-lg">
      <div className="p-4">
        <div className="flex items-center min-w-0 space-x-3">
          <PlatformIcon platform={rss.blogPlatform} image={rss.blogImage} name={rss.name} className="flex-shrink-0 w-10 h-10" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{rss.name}</p>
              <BlogPlatformBadge platform={rss.blogPlatform} className="flex-shrink-0" />
            </div>
            <p className="text-sm text-gray-500 truncate">{rss.userName}</p>
            <a
              href={rss.blogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-gray-400 truncate hover:underline"
            >
              {rss.blogUrl}
            </a>
            <p className="flex items-center gap-1 text-sm text-gray-400 mt-0.5">
              <FileText className="w-3.5 h-3.5" />
              게시글 {rss.feedCount}개
            </p>
            <button
              onClick={() => setSubscribersOpen(true)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#FF870D]"
            >
              <Users className="w-3.5 h-3.5" />
              구독자 {rss.subscriberCount}명
            </button>
            <p className={`flex items-center gap-1 text-sm ${getSuspensionColor(rss.suspensionCount)}`}>
              <ShieldAlert className="w-3.5 h-3.5" />
              정지 {rss.suspensionCount}회
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1 mt-3 pt-3 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
            펼치기
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(rss)}>
            <Pencil className="w-4 h-4" />
            수정
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(rss)}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
            삭제
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
