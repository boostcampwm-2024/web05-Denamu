import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";

import { useBlogSubscribers } from "@/hooks/queries/useSubscription.ts";

interface SubscribersModalProps {
  rssId: number;
  rssName: string;
  open: boolean;
  onClose: () => void;
}

export const SubscribersModal = ({ rssId, rssName, open, onClose }: SubscribersModalProps) => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = useBlogSubscribers(
    rssId,
    open
  );

  const subscribers = data?.pages.flatMap((page) => page.result) ?? [];

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>구독자 목록</DialogTitle>
          <DialogDescription>'{rssName}'을(를) 구독한 사용자입니다.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading && <p className="py-4 text-sm text-gray-400">불러오는 중...</p>}
          {isError && <p className="py-4 text-sm text-red-500">구독자를 불러오지 못했습니다.</p>}
          {!isLoading && !isError && subscribers.length === 0 && (
            <p className="py-4 text-sm text-gray-400">아직 구독자가 없습니다.</p>
          )}

          <ul className="space-y-2">
            {subscribers.map((subscriber) => (
              <li key={subscriber.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                {subscriber.user.profileImage ? (
                  <img
                    src={subscriber.user.profileImage}
                    alt={subscriber.user.userName}
                    className="object-cover w-9 h-9 rounded-full"
                  />
                ) : (
                  <div className="flex items-center justify-center text-sm font-semibold text-gray-500 rounded-full w-9 h-9 bg-gray-200">
                    {subscriber.user.userName.charAt(0)}
                  </div>
                )}
                <span className="font-medium truncate">{subscriber.user.userName}</span>
              </li>
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
      </DialogContent>
    </Dialog>
  );
};
