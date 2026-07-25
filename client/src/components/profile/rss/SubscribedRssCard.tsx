import { FileText, X } from "lucide-react";

import { BlogPlatformBadge } from "@/components/profile/rss/BlogPlatformBadge.tsx";
import { PlatformIcon } from "@/components/profile/rss/PlatformIcon.tsx";
import { Button } from "@/components/ui/button.tsx";

import { useCustomToast } from "@/hooks/common/useCustomToast.ts";
import { useToggleSubscription } from "@/hooks/queries/useSubscription.ts";

import { SubscribedRss } from "@/types/subscription.ts";

interface SubscribedRssCardProps {
  rss: SubscribedRss;
}

export const SubscribedRssCard = ({ rss }: SubscribedRssCardProps) => {
  const { toast } = useCustomToast();
  const toggleMutation = useToggleSubscription(rss.id);

  const handleUnsubscribe = () => {
    if (toggleMutation.isPending) return;
    toggleMutation.mutate(true, {
      onSuccess: () => toast({ title: "구독 해제", description: `'${rss.name}' 구독을 해제했습니다.` }),
      onError: () => toast({ title: "해제 실패", description: "다시 시도해주세요." }),
    });
  };

  return (
    <li className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
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
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleUnsubscribe}
        disabled={toggleMutation.isPending}
        className="flex-shrink-0 gap-1 ml-3 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
      >
        <X className="w-4 h-4" />
        구독 해제
      </Button>
    </li>
  );
};
