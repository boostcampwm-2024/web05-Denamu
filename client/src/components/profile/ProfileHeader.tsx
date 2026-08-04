import { useState } from "react";

import { MoreVertical, Ban, FileText, Flag, Users } from "lucide-react";

import { ReportDialog } from "@/components/common/ReportDialog";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Switch } from "@/components/ui/switch.tsx";

import { useCustomToast } from "@/hooks/common/useCustomToast.ts";
import { useBlockRss, useBlockUser } from "@/hooks/queries/useBlock.ts";
import { useCertifiedRss } from "@/hooks/queries/useProfile.ts";
import { useReportUser } from "@/hooks/queries/useReport";

import { CreateReportPayload } from "@/types/report";

interface ProfileHeaderProps {
  name: string;
  email: string;
  profileImage: string | null;
  introduction: string | null;
  blockableUserId?: number;
}

export const ProfileHeader = ({ name, email, profileImage, introduction, blockableUserId }: ProfileHeaderProps) => {
  const initials = name ? name.substring(0, 2).toUpperCase() : "사용자";
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedRssIds, setSelectedRssIds] = useState<Set<number>>(new Set());
  const { toast } = useCustomToast();
  const { mutateAsync: blockUser } = useBlockUser();
  const { mutateAsync: blockRss } = useBlockRss();
  const { mutate: reportUser, isPending: isReportPending } = useReportUser();
  const { data: ownedRss = [] } = useCertifiedRss(blockableUserId ?? 0);

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

  const handleBlock = async () => {
    if (!blockableUserId) return;
    const rssIdsToBlock = [...selectedRssIds];
    setShowBlockConfirm(false);

    try {
      await blockUser(blockableUserId);
      const results = await Promise.allSettled(rssIdsToBlock.map((rssId) => blockRss(rssId)));
      const failedRssCount = results.filter((result) => result.status === "rejected").length;

      if (failedRssCount > 0) {
        toast({
          title: "차단 완료",
          description: `${name}님을 차단했습니다. RSS ${failedRssCount}건은 차단하지 못했습니다.`,
        });
      } else {
        toast({ title: "차단 완료", description: `${name}님을 차단했습니다.` });
      }
    } catch {
      toast({ title: "차단 실패", description: "잠시 후 다시 시도해주세요." });
    } finally {
      setSelectedRssIds(new Set());
    }
  };

  const handleReport = (payload: CreateReportPayload, blockToo: boolean) => {
    if (!blockableUserId) return;
    reportUser(
      { userId: blockableUserId, payload },
      {
        onSuccess: async () => {
          setShowReportDialog(false);
          if (!blockToo) {
            toast({ title: "신고 접수 완료", description: "신고가 접수되었습니다." });
            return;
          }
          try {
            await blockUser(blockableUserId);
            toast({ title: "신고 접수 완료", description: `신고가 접수되었고, ${name}님을 차단했습니다.` });
          } catch {
            toast({
              title: "신고 접수 완료",
              description: "신고는 접수되었지만 차단에 실패했습니다. 잠시 후 다시 시도해주세요.",
            });
          }
        },
        onError: () => {
          toast({ title: "신고 실패", description: "잠시 후 다시 시도해주세요." });
        },
      }
    );
  };

  return (
    <Card className="mb-8 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start space-x-6">
          <Avatar className="flex-shrink-0 w-24 h-24 border-4 border-white shadow">
            {profileImage && <AvatarImage src={profileImage} alt={name} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold">{name}</h1>
            {email && <p className="mt-1 text-gray-600">{email}</p>}
            <p className="mt-4 text-gray-800 whitespace-pre-wrap">
              {introduction ? introduction : <span className="text-gray-400">자기소개가 없습니다.</span>}
            </p>
          </div>
          {blockableUserId && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-gray-500 transition-colors rounded-lg hover:bg-gray-100"
                  aria-label="더보기"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                  <Flag className="w-4 h-4 mr-2" />
                  신고하기
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setShowBlockConfirm(true)}>
                  <Ban className="w-4 h-4 mr-2" />
                  차단하기
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>

      <AlertDialog open={showBlockConfirm} onOpenChange={setShowBlockConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{name} 유저를 차단하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>댓글, 프로필 페이지 열람이 제한됩니다.</AlertDialogDescription>
          </AlertDialogHeader>
          {ownedRss.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">함께 차단할 RSS</p>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-xs font-medium text-[#FF870D] hover:underline"
                >
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
                      <PlatformIcon
                        platform={rss.blogPlatform}
                        image={rss.blogImage}
                        className="flex-shrink-0 w-9 h-9"
                      />
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
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleBlock}>
              차단
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        title={`${name} 유저 신고`}
        isPending={isReportPending}
        withBlockOption
        onSubmit={handleReport}
      />
    </Card>
  );
};
