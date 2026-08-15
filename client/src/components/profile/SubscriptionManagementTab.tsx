import { ChevronLeft, FileText, Users } from "lucide-react";

import { SubscribeButton } from "@/components/common/Card/detail/SubscribeButton.tsx";
import { BlogPlatformBadge } from "@/components/profile/rss/BlogPlatformBadge.tsx";
import { PlatformIcon } from "@/components/profile/rss/PlatformIcon.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";

import { useUserSubscriptions } from "@/hooks/queries/useSubscription.ts";

import { useAuthStore } from "@/store/useAuthStore.ts";

interface SubscriptionManagementTabProps {
  userId: number;
  isOwner: boolean;
  onBack: () => void;
}

export const SubscriptionManagementTab = ({ userId, isOwner, onBack }: SubscriptionManagementTabProps) => {
  const { data: list = [], isLoading } = useUserSubscriptions(userId);

  const { isAuthenticated, userInfo } = useAuthStore();
  const { data: mySubscriptions = [] } = useUserSubscriptions(userInfo.id ?? 0, isAuthenticated && !isOwner);
  const mySubscribedIds = new Set(mySubscriptions.map((rss) => rss.id));

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors rounded-lg hover:bg-gray-100"
            aria-label="뒤로"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold">구독 중인 RSS</h3>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-400">불러오는 중...</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-gray-400">구독 중인 RSS가 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {list.map((rss) => (
              <li
                key={rss.id}
                className="flex items-center justify-between gap-3 p-4 border-0 md:border border-gray-100 rounded-lg"
              >
                <div className="flex items-center min-w-0 gap-3">
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
                      className="hidden md:block text-sm text-gray-400 truncate hover:underline"
                    >
                      {rss.blogUrl}
                    </a>
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
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <SubscribeButton rssId={rss.id} isSubscribed={isOwner || mySubscribedIds.has(rss.id)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
