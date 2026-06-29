import { useState } from "react";

import { ChevronDown, FileText } from "lucide-react";

import { PlatformIcon } from "@/components/profile/rss/PlatformIcon.tsx";
import { RssFeedRow } from "@/components/profile/rss/RssFeedRow.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";

import { useRssFeeds } from "@/hooks/queries/useProfile.ts";

import { CertifiedRss } from "@/types/profile.ts";

interface CertifiedRssCardProps {
  userId: number;
  rss: CertifiedRss;
}

export const CertifiedRssCard = ({ userId, rss }: CertifiedRssCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = useRssFeeds(
    userId,
    rss.id,
    expanded
  );

  const feeds = data?.pages.flatMap((page) => page.result) ?? [];

  return (
    <li className="border border-gray-100 rounded-lg">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center min-w-0 space-x-3">
          <PlatformIcon platform={rss.blogPlatform} className="flex-shrink-0 w-10 h-10" />
          <div className="min-w-0">
            <p className="font-medium truncate">{rss.name}</p>
            <a
              href={rss.rssUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 truncate hover:underline"
            >
              {rss.rssUrl}
            </a>
            <p className="flex items-center gap-1 text-sm text-gray-400">
              <FileText className="w-3.5 h-3.5" />
              게시글 {rss.feedCount}개
            </p>
          </div>
        </div>
        <div className="flex items-center flex-shrink-0 gap-2 ml-3">
          <Badge variant="secondary">{rss.blogPlatform}</Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded((prev) => !prev)}
            aria-label="게시글 목록 펼치기"
            aria-expanded={expanded}
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="px-3 py-3 border-t border-gray-100">
          {isLoading && <p className="text-sm text-gray-400">게시글을 불러오는 중...</p>}
          {isError && <p className="text-sm text-red-500">게시글을 불러오지 못했습니다.</p>}
          {!isLoading && !isError && feeds.length === 0 && (
            <p className="text-sm text-gray-400">게시글이 없습니다.</p>
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
    </li>
  );
};
