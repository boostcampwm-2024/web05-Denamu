import { Link, useNavigate } from "react-router-dom";

import { FileText, Users } from "lucide-react";

import { SubscribeButton } from "@/components/common/Card/detail/SubscribeButton.tsx";
import { BlogPlatformBadge } from "@/components/profile/rss/BlogPlatformBadge.tsx";
import { PlatformIcon } from "@/components/profile/rss/PlatformIcon.tsx";

import { CertifiedRss } from "@/types/profile.ts";

interface CertifiedRssCardProps {
  userId: number;
  rss: CertifiedRss;
  isOwner: boolean;
}

export const CertifiedRssCard = ({ userId, rss, isOwner }: CertifiedRssCardProps) => {
  const navigate = useNavigate();

  return (
    <li
      className="transition-colors border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50"
      onClick={() => navigate(`/rss/${rss.id}`)}
    >
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center min-w-0 gap-3">
          <PlatformIcon platform={rss.blogPlatform} image={rss.blogImage} className="flex-shrink-0 w-10 h-10" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link to={`/rss/${rss.id}`} className="font-medium truncate hover:underline">
                {rss.name}
              </Link>
              <BlogPlatformBadge platform={rss.blogPlatform} className="flex-shrink-0" />
            </div>
            <a
              href={rss.rssUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 truncate hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {rss.rssUrl}
            </a>
            <p className="flex items-center gap-3 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                게시글 {rss.feedCount}개
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                구독자 {rss.subscriberCount}명
              </span>
            </p>
          </div>
        </div>
        {!isOwner && (
          <div className="flex-shrink-0 ml-3" onClick={(e) => e.stopPropagation()}>
            <SubscribeButton
              rssId={rss.id}
              isSubscribed={rss.isSubscribed}
              invalidateKeys={[["certifiedRss", userId]]}
            />
          </div>
        )}
      </div>
    </li>
  );
};
