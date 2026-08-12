import { useState } from "react";

import { FileText, Users } from "lucide-react";

import { BlogPlatformBadge } from "@/components/profile/rss/BlogPlatformBadge.tsx";
import { PlatformIcon } from "@/components/profile/rss/PlatformIcon.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { Switch } from "@/components/ui/switch.tsx";

import { CertifiedRss } from "@/types/profile";

interface BlockConfirmDialogOwner {
  id: number;
  userName: string;
}

interface BlockConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  owner?: BlockConfirmDialogOwner;
  ownedRss?: CertifiedRss[];
  onConfirm: (block: { blockOwner: boolean; rssIds: number[] }) => void;
}

export function BlockConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  owner,
  ownedRss = [],
  onConfirm,
}: BlockConfirmDialogProps) {
  const [blockOwnerToo, setBlockOwnerToo] = useState(false);
  const [selectedRssIds, setSelectedRssIds] = useState<Set<number>>(new Set());

  const allSelected = ownedRss.length > 0 && ownedRss.every((rss) => selectedRssIds.has(rss.id));

  const toggleRss = (rssId: number) => {
    setSelectedRssIds((prev) => {
      const next = new Set(prev);
      if (next.has(rssId)) {
        next.delete(rssId);
      } else {
        next.add(rssId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedRssIds(allSelected ? new Set() : new Set(ownedRss.map((rss) => rss.id)));
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setBlockOwnerToo(false);
      setSelectedRssIds(new Set());
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = () => {
    handleOpenChange(false);
    onConfirm({ blockOwner: blockOwnerToo, rssIds: [...selectedRssIds] });
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>

        {owner && (
          <div className="flex items-center justify-between gap-3 p-3 border border-gray-100 rounded-lg">
            <p className="text-sm truncate">{owner.userName} 유저도 함께 차단</p>
            <Switch
              checked={blockOwnerToo}
              onCheckedChange={setBlockOwnerToo}
              aria-label={`${owner.userName} 유저도 차단`}
              className="flex-shrink-0"
            />
          </div>
        )}

        {ownedRss.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">해당 유저가 소유중인 RSS 차단</p>
              <button type="button" onClick={toggleAll} className="text-xs font-medium text-[#FF870D] hover:underline">
                {allSelected ? "모두 해제" : "모두 선택"}
              </button>
            </div>
            <ul className="pr-1 space-y-2 overflow-y-auto max-h-60">
              {ownedRss.map((rss) => (
                <li
                  key={rss.id}
                  className="flex items-center justify-between gap-3 p-3 border border-gray-100 rounded-lg"
                >
                  <div className="flex items-center min-w-0 gap-3">
                    <PlatformIcon platform={rss.blogPlatform} image={rss.blogImage} name={rss.name} className="flex-shrink-0 w-9 h-9" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{rss.name}</p>
                        <BlogPlatformBadge platform={rss.blogPlatform} className="flex-shrink-0" />
                      </div>
                      <p className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
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
                  <Switch
                    checked={selectedRssIds.has(rss.id)}
                    onCheckedChange={() => toggleRss(rss.id)}
                    aria-label={`${rss.name} 차단`}
                    className="flex-shrink-0"
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleConfirm}>
            차단
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
