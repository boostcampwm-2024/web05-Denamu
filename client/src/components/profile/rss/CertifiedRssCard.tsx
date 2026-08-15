import { useNavigate } from "react-router-dom";

import { FileText, Users } from "lucide-react";

import { SubscribeButton } from "@/components/common/Card/detail/SubscribeButton.tsx";
import { RssCardInfo } from "@/components/profile/rss/RssCardInfo.tsx";

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
      className="transition-colors border-0 md:border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50"
      onClick={() => navigate(`/rss/${rss.id}`)}
    >
      <div className="flex items-center justify-between gap-3 p-4">
        <RssCardInfo
          name={rss.name}
          nameTo={`/rss/${rss.id}`}
          userName={rss.userName}
          blogUrl={rss.blogUrl}
          blogPlatform={rss.blogPlatform}
          blogImage={rss.blogImage}
        >
          <p className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              게시글 {rss.feedCount}개
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              구독자 {rss.subscriberCount}명
            </span>
          </p>
        </RssCardInfo>
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
